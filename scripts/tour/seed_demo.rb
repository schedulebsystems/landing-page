# frozen_string_literal: true

# Salão de exemplo do tour da landing ("Studio Camila"), para capturar as telas reais do app.
#
# Roda SÓ num banco descartável, de dentro de um checkout do scheduler_api (depois de
# `bin/rails db:schema:load db:seed skedoole:plans` nesse banco):
#   DATABASE_URL=postgres://.../scheduler_tour REDIS_URL=redis://localhost:6379/<db vazio> \
#     bin/rails runner /caminho/landing-page/scripts/tour/seed_demo.rb
#
# Nada sai da máquina: Evolution e Asaas ficam neutralizados neste processo e nenhum Sidekiq
# deve estar rodando no Redis escolhido (os jobs enfileirados são descartados no fim).

abort 'recuse: rode num banco scheduler_tour' unless ActiveRecord::Base.connection.current_database.include?('tour')

IMG = ENV.fetch('TOUR_IMG_DIR')

# ---------------------------------------------------------------- neutraliza serviços externos
module TourNoNetwork
  def call(*) = true
  def message_id = nil
end
WhatsApp::EvolutionService.prepend(TourNoNetwork) if defined?(WhatsApp::EvolutionService)
WhatsApp::EvolutionMediaService.prepend(TourNoNetwork) if defined?(WhatsApp::EvolutionMediaService)

Time.zone = 'America/Sao_Paulo'
srand(42)

def anexar(record, attr, arquivo)
  path = File.join(IMG, arquivo)
  record.public_send(attr).attach(io: File.open(path), filename: arquivo,
                                  content_type: arquivo.end_with?('.png') ? 'image/png' : 'image/jpeg')
end

# ---------------------------------------------------------------- referência
# pré-requisito (rodar antes): bin/rails db:seed && bin/rails skedoole:plans
abort 'rode db:seed e skedoole:plans antes' if Permission.none? || AccountPlan.none?

# ---------------------------------------------------------------- conta
SUB = 'studio-camila'
Account.unscoped.where(subdomain: SUB).find_each { |a| abort "conta #{SUB} já existe — recrie o banco" if a }

account = Account.create!(
  name: 'Studio Camila', email: 'contato@studiocamila.exemplo', subdomain: SUB, segment: 'salao',
  admin_name: 'Camila Duarte', admin_cellphone: '47991230001', admin_password: 'tour-demo-2026'
)
account.reload
AccountSubscriptions::TestActivateService.new(account: account).call
account.reload
Many::AccountSubscription.where(account_id: account.id).update_all(professionals_limit: 10)
account.update_columns(ai_addon_status: AiAddonStatusEnum::ACTIVE, whatsapp_bot_enabled: true, ai_addon_included: false,
                       ai_messages_quota_override: 100_000)

matriz = account.matriz
matriz.update_columns(address: 'Rua XV de Novembro', address_number: '1200', province: 'Centro', city: 'Joinville',
                      state: 'SC', postal_code: '89201600', phone: '4733330000')
anexar(account, :logo, 'logo.png') if account.respond_to?(:logo)
anexar(account, :background, 'capa.jpg') if account.respond_to?(:background)

dona = account.users.find_by!(is_account_admin: true)
dona.update_columns(onboarding_step: 0, will_serve_customers: true, service_percentage: 0)

# feriado importado de amanhã (20/11) atrapalha a semana
DayOff.where(account_id: account.id).delete_all if defined?(DayOff)

# conectado via stub local da Evolution (EVOLUTION_API_URL) — nunca a Evolution real
account.update_columns(evolution_instance_name: 'studio-camila', whatsapp_connection_state: 1)
matriz.update_columns(evolution_instance_name: 'studio-camila', whatsapp_connection_state: 1)

# ---------------------------------------------------------------- equipe
pros = {
  'Camila' => { nome: 'Camila Duarte', usuario: dona },
  'Bruna' => { nome: 'Bruna Oliveira', cel: '47991230002' },
  'Rafa' => { nome: 'Rafaela Souza', cel: '47991230003' },
  'Lívia' => { nome: 'Lívia Martins', cel: '47991230004' },
}
pros.each_value do |p|
  next if p[:usuario]

  p[:usuario] = account.users.create!(
    name: p[:nome], cellphone: p[:cel], email: "#{p[:nome].parameterize}@studiocamila.exemplo",
    profile_type: 1, will_serve_customers: true, status: 'ativo', headquarter_id: matriz.id,
    service_percentage: 40, password: 'tour-demo-2026', password_confirmation: 'tour-demo-2026'
  )
end
P = pros.transform_values { |p| p[:usuario] }

# ---------------------------------------------------------------- serviços
SERVICOS = [
  ['Corte feminino', 90, 60, %w[Rafa], 'corte.jpg'],
  ['Escova modelada', 65, 45, %w[Rafa], 'escova.jpg'],
  ['Coloração', 180, 120, %w[Rafa], 'coloracao.jpg'],
  ['Pé e mão', 55, 60, %w[Bruna Lívia], 'pe-e-mao.jpg'],
  ['Alongamento em gel', 160, 120, %w[Bruna], 'alongamento.jpg'],
  ['Manutenção de gel', 110, 90, %w[Bruna], 'manutencao.jpg'],
  ['Design de sobrancelha', 50, 30, %w[Camila Lívia], 'sobrancelha.jpg'],
  ['Lash lift', 140, 60, %w[Camila], 'lash-lift.jpg'],
  ['Extensão de cílios', 190, 120, %w[Camila], 'extensao.jpg'],
  ['Spa dos pés', 85, 60, %w[Lívia], 'spa-pes.jpg'],
].freeze
S = {}
SERVICOS.each do |nome, preco, dur, quem, img|
  attrs = { name: nome, suggested_price: preco, default_duration: dur, professional_ids: quem.map { P[_1].id } }
  attrs[:show_in_vitrine] = true if Service.column_names.include?('show_in_vitrine')
  s = account.services.create!(attrs)
  if defined?(ServiceImage)
    si = ServiceImage.new(service: s, position: 0)
    anexar(si, :file, img)
    si.save!
  end
  S[nome] = s
end
QUEM_FAZ = SERVICOS.to_h { |n, _p, _d, quem, _i| [n, quem] }

# ---------------------------------------------------------------- clientes
NOMES = %w[
  Marina\ Alves Joana\ Ribeiro Renata\ Costa Bianca\ Ferreira Paula\ Mendes Larissa\ Gomes Fernanda\ Rocha
  Aline\ Barbosa Camila\ Teixeira Juliana\ Pires Patrícia\ Lima Tatiane\ Moraes Vanessa\ Cardoso Carolina\ Nunes
  Débora\ Freitas Letícia\ Araújo Natália\ Correia Priscila\ Dias Sabrina\ Melo Thaís\ Castro Viviane\ Ramos
  Gabriela\ Lopes Isabela\ Farias Raquel\ Vieira Simone\ Batista Luana\ Prado Mônica\ Sales Elaine\ Cunha
  Rosana\ Peixoto Helena\ Duarte Beatriz\ Campos Daniela\ Reis Kelly\ Andrade Cristina\ Moura Adriana\ Rezende
  Jéssica\ Machado Lúcia\ Fontes Márcia\ Neves Sônia\ Brandão Yasmin\ Torres
].freeze
CLIENTES = NOMES.each_with_index.map do |nome, i|
  account.users.create!(
    name: nome, cellphone: format('4799%07d', 8_100_000 + i * 137), profile_type: 2,
    birthday: Date.new(1975 + (i % 25), ((i * 5) % 12) + 1, ((i * 7) % 27) + 1),
    password: 'tour-demo-2026', password_confirmation: 'tour-demo-2026'
  )
end
# aniversário nesta semana para "Chamar hoje"
CLIENTES[5].update_columns(birthday: Date.new(1990, 11, 22))

# ---------------------------------------------------------------- atendimentos
hoje = Time.zone.today
agora = Time.zone.now
METODOS = [PaymentMethodEnum::PIX, PaymentMethodEnum::PIX, PaymentMethodEnum::CREDIT, PaymentMethodEnum::DEBIT,
           PaymentMethodEnum::CASH].freeze
ocupado = Hash.new { |h, k| h[k] = [] }

marcar = lambda do |cliente:, servico:, inicio:, status:, origem: AttendanceOriginEnum::APP, quem: nil|
  quem ||= QUEM_FAZ[servico].sample
  pro = P[quem]
  dur = S[servico].default_duration
  fim = inicio + dur.minutes
  return nil if ocupado[pro.id].any? { |(a, b)| inicio < b && fim > a }

  attrs = {
    account: account, headquarter_id: matriz.id, professional_id: pro.id, customer_id: cliente.id,
    attendance_type: AttendanceTypeEnum::SCHEDULE, initial_hour: inicio, final_hour: fim, status: AttendanceStatusEnum::WAITING,
    origin: origem, remembered: AttendanceRememberEnum.list.first, created_by_id: dona.id,
    services_array: [{ id: S[servico].id }]
  }
  at = Attendance.new(attrs)
  at.save!(validate: false)
  case status
  when :pago
    at.update_columns(status: AttendanceStatusEnum::IN_PROGRESS)
    at.reload.update!(status: AttendanceStatusEnum::PAID, check_out_at: fim + 5.minutes,
                      payment_method: METODOS.sample, updated_by_id: dona.id)
  when :cadeira
    at.update_columns(status: AttendanceStatusEnum::IN_PROGRESS)
  when :falta
    at.update_columns(status: AttendanceStatusEnum::BLOCKED)
  end
  ocupado[pro.id] << [inicio, fim]
  at
rescue ActiveRecord::RecordInvalid, ActiveRecord::StatementInvalid => e
  warn "pulei #{servico} #{inicio}: #{e.message.truncate(120)}"
  nil
end

na_hora = ->(dia, h, m = 0) { Time.zone.local(dia.year, dia.month, dia.day, h, m) }
HORARIOS = [[9, 0], [10, 0], [10, 30], [11, 0], [13, 0], [14, 0], [14, 30], [15, 30], [16, 0], [17, 0], [18, 0]].freeze

# As 8 primeiras clientes somem há mais de 35 dias e não têm nada marcado: caem em "Chamar hoje".
RECENTES = CLIENTES.drop(8)

# histórico antigo: de 15 a 120 dias atrás, seg–sáb (mais esparso)
(15..120).each do |atras|
  dia = hoje - atras
  next if dia.sunday?

  HORARIOS.sample(rand(6..10)).each do |h, m|
    servico = SERVICOS.sample.first
    marcar.call(cliente: (atras < 35 ? RECENTES : CLIENTES).sample, servico: servico, inicio: na_hora.call(dia, h, m),
                status: rand < 0.04 ? :falta : :pago)
  end
end

# duas últimas semanas, hoje e a próxima semana: agenda por profissional
(-14..9).each do |frente|
  dia = hoje + frente
  next if dia.sunday?

  densidade = if frente.negative? then 0.8
              elsif frente.zero? then 1.0
              else [0.85, 0.7, 0.6, 0.5, 0.4][[frente - 1, 4].min]
              end
  P.each_key do |quem|
    HORARIOS.each do |h, m|
      inicio = na_hora.call(dia, h, m)
      next if rand > densidade

      servico = QUEM_FAZ.select { |_n, q| q.include?(quem) }.keys.sample
      status = if inicio + S[servico].default_duration.minutes <= agora then :pago
               elsif inicio <= agora then :cadeira
               else :aguardando
               end
      origem = rand < 0.35 ? AttendanceOriginEnum::WHATSAPP_BOT : AttendanceOriginEnum::APP
      marcar.call(cliente: RECENTES.sample, servico: servico, inicio: inicio, status: status, origem: origem, quem: quem)
    end
  end
end


# acertos de comissão das quinzenas fechadas (a atual fica "a pagar")
inicio_quinzena = hoje.day > 15 ? hoje.change(day: 16) : hoje.beginning_of_month
Commission.where(account_id: account.id, paid_at: nil).where('reference_date < ?', inicio_quinzena)
          .group_by { |c| [c.professional_id, c.reference_date.day > 15 ? c.reference_date.change(day: 16) : c.reference_date.beginning_of_month] }
          .each do |(_pro, q), cs|
  fim_q = q.day == 16 ? q.end_of_month : q.change(day: 15)
  Commissions::RegisterPayoutService.new(account: account, commission_ids: cs.map(&:id), payment_method: PaymentMethodEnum::PIX,
                                         paid_on: fim_q + 1, notes: nil, created_by: dona).call
end

# avaliações em parte dos pagos
if defined?(Evaluation)
  Attendance.where(account_id: account.id, status: AttendanceStatusEnum::PAID).order('RANDOM()').limit(140).each do |at|
    Evaluation.create!(account_id: account.id, attendance_id: at.id, professional_id: at.professional_id,
                       customer_id: at.customer_id, rating: [5, 5, 5, 5, 4].sample)
  rescue StandardError
    nil
  end
end

# ---------------------------------------------------------------- WhatsApp (inbox da Secretária)
CONVERSAS = [
  [CLIENTES[1], 'quer saber se dá pra parcelar o alongamento', [
    [0, 'Oi! Vocês parcelam o alongamento em gel?'],
    [1, 'Oi, Joana! O alongamento em gel custa R$ 160,00. Sobre parcelamento, vou chamar a Camila pra te responder certinho, tá?'],
    [0, 'Tá bom, obrigada!'],
  ]],
  [CLIENTES[9], 'pediu horário que não está na agenda', [
    [0, 'Bom dia! Consegue me encaixar hoje às 19h pra fazer a sobrancelha?'],
    [1, 'Bom dia, Juliana! Hoje às 19h não tem horário livre. A Camila tem 17h30 hoje ou amanhã às 9h. Algum desses serve?'],
    [0, 'Nenhum dos dois… não tem como abrir uma exceção? É rapidinho'],
    [1, 'Vou passar seu pedido pra Camila ver se consegue um encaixe. Ela te responde por aqui.'],
  ]],
  [CLIENTES[14], 'reclamou de demora no último atendimento', [
    [0, 'Oi, da última vez esperei 30 min pra ser atendida 😕'],
    [1, 'Oi, Débora, sinto muito pela espera. Vou avisar a Camila agora mesmo pra ela falar com você.'],
  ]],
].freeze
CONVERSAS.each_with_index do |(cliente, motivo, msgs), i|
  base = agora - (i * 47 + 12).minutes - msgs.size.minutes
  conv = WhatsappConversation.create!(
    account_id: account.id, cellphone: cliente.cellphone, status: WhatsappConversationStatusEnum::HUMAN,
    escalated_reason: motivo, escalated_at: base + (msgs.size - 1).minutes, last_interaction_at: base + msgs.size.minutes,
    context: { 'customer_id' => cliente.id, 'customer_name' => cliente.name }, instance_name: 'studio-camila'
  )
  msgs.each_with_index do |(autor, texto), k|
    WhatsappMessage.create!(account_id: account.id, whatsapp_conversation_id: conv.id, author: autor, body: texto,
                            created_at: base + k.minutes, updated_at: base + k.minutes)
  end
end

# ---------------------------------------------------------------- limpeza de jobs enfileirados
Sidekiq.redis(&:flushdb) if defined?(Sidekiq) && ENV['REDIS_URL'].to_s.match?(%r{/1[1-5]\z})

puts({ conta: SUB, dona: dona.email, id_dona: dona.id, profissionais: P.transform_values(&:id),
       atendimentos: Attendance.where(account_id: account.id).count,
       pagos: Attendance.where(account_id: account.id, status: AttendanceStatusEnum::PAID).count,
       clientes: CLIENTES.size, conversas: WhatsappConversation.where(account_id: account.id).count }.to_json)
