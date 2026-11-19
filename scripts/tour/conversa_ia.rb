# frozen_string_literal: true

# Gera a conversa da demo da IA com a Secretária 24h DE VERDADE (Gemini), no salão de exemplo
# do tour. Nada é enviado no WhatsApp: a Evolution fica neutralizada neste processo.
#
#   GEMINI_API_KEY=$(cat ~/.gemini_key) DATABASE_URL=.../scheduler_tour REDIS_URL=redis://localhost:6379/<db> \
#   OUT=/caminho/landing-page/src/data/conversa-ia.json bin/rails runner /caminho/scripts/tour/conversa_ia.rb
#
# Leia a transcrição antes de usar: se a resposta sair estranha, rode de novo (não é determinístico).

abort 'recuse: rode num banco scheduler_tour' unless ActiveRecord::Base.connection.current_database.include?('tour')
abort 'defina GEMINI_API_KEY' if ENV['GEMINI_API_KEY'].blank?

module TourNoNetwork
  def call(*) = true
  def message_id = nil
end
WhatsApp::EvolutionService.prepend(TourNoNetwork)
WhatsApp::EvolutionMediaService.prepend(TourNoNetwork) if defined?(WhatsApp::EvolutionMediaService)
WhatsAppBot::SupportBroadcaster.define_singleton_method(:call) { |*| nil } if defined?(WhatsAppBot::SupportBroadcaster)

account = Account.find_by!(subdomain: 'studio-camila')
cliente = User.find_by!(account_id: account.id, name: 'Raquel Vieira')

# Roteiro da cliente. Depois de escolher o horário: se a IA pedir confirmação, a cliente confirma;
# se já tiver marcado, só agradece.
ABERTURA = ['oii boa noite! vcs fazem pé e mão? queria pra sábado de manhã', 'quanto fica?', 'pode ser 9h30 então'].freeze
CONFIRMA = 'isso, pode marcar'
FECHO = 'obrigadaaa 🥰'

WhatsappConversation.where(account_id: account.id, cellphone: cliente.cellphone).destroy_all
# remove agendamentos que rodadas anteriores desta demo criaram (libera o horário)
Attendance.where(account_id: account.id, customer_id: cliente.id, origin: AttendanceOriginEnum::WHATSAPP_BOT)
          .where('initial_hour > ?', Time.current).find_each(&:destroy)
conversa = WhatsappConversation.find_or_create_for(account: account, cellphone: cliente.cellphone)
antes = Attendance.where(account_id: account.id, customer_id: cliente.id).pluck(:id)

trocas = []
ferramentas = []
WhatsAppBot::ConversationService.prepend(Module.new do
  define_method(:execute_tool) do |nome, args|
    ferramentas << nome
    super(nome, args)
  end
end)

falar = lambda do |texto|
  resposta = WhatsAppBot::ConversationService.new(account: account, conversation: conversa.reload,
                                                  cellphone: cliente.cellphone, incoming_text: texto).call
  trocas << { de: 'cliente', texto: texto }
  trocas << { de: 'ia', texto: resposta.to_s }
  puts "CLIENTE: #{texto}\nIA: #{resposta}\n\n"
end
criado = -> { Attendance.where(account_id: account.id, customer_id: cliente.id).where.not(id: antes).exists? }

ABERTURA.each { |t| falar.call(t) }
falar.call(CONFIRMA) unless criado.call
falar.call(FECHO)

novo = Attendance.where(account_id: account.id, customer_id: cliente.id).where.not(id: antes).first
resultado = novo && {
  servico: novo.attendance_services.map { |as| as.service&.name }.compact.join(', '),
  profissional: novo.professional&.name, inicio: novo.initial_hour.iso8601, origem: novo.origin
}
puts "ferramentas: #{ferramentas.join(', ')}"
puts "agendamento criado: #{resultado.inspect}"
puts "status da conversa: #{conversa.reload.status}"

File.write(ENV.fetch('OUT'), JSON.pretty_generate({
  gerado_em: Time.current.iso8601, modelo: WhatsAppBot::GeminiClient::DEFAULT_MODEL,
  cliente: cliente.name.split.first, trocas: trocas, agendamento: resultado
}))
