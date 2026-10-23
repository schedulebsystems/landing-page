import { formatBRL, TENANT } from "@data/sandbox";
import { createSandbox, type SandboxSnapshot } from "./store";

const STEP_LABEL: Record<string, string> = {
  professional: "Escolher serviços",
  service: "Escolher horário",
  slot: "Confirmar agendamento",
};

function setText(
  root: ParentNode,
  selector: string,
  text: string,
): void {
  const el = root.querySelector<HTMLElement>(selector);
  if (el && el.textContent !== text) el.textContent = text;
}

function addMinutes(time: string, minutes: number): string {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60,
  ).padStart(2, "0")}`;
}

function clientState(snapshot: SandboxSnapshot): string {
  const { phase, branch } = snapshot.state;
  if (phase === "cancelled") return "cancelled";
  if (phase === "confirmed" || (phase === "done" && branch === "confirm")) {
    return "confirmed";
  }
  return "booked";
}

function renderClient(root: HTMLElement, snapshot: SandboxSnapshot): void {
  const phone = root.querySelector<HTMLElement>("[data-phone-client]");
  if (!phone) return;

  const step = snapshot.clientStep;
  const state = snapshot.state;
  phone.dataset.clientState = clientState(snapshot);

  phone.querySelectorAll<HTMLElement>("[data-step]").forEach((section) => {
    section.hidden = section.dataset.step !== step;
  });

  phone
    .querySelectorAll<HTMLElement>("[data-action=professional]")
    .forEach((button) => {
      const selected = button.dataset.value === state.professionalId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

  phone
    .querySelectorAll<HTMLElement>("[data-action=service]")
    .forEach((button) => {
      const selected = button.dataset.value === state.serviceId;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

  const available = snapshot.service.duration <= 45;
  phone.querySelectorAll<HTMLElement>("[data-slot-available]").forEach((button) => {
    button.hidden = !available;
    const selected = available && button.dataset.value === state.slot;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  const slotsEmpty = phone.querySelector<HTMLElement>("[data-slots-empty]");
  if (slotsEmpty) slotsEmpty.hidden = available;

  const nav = phone.querySelector<HTMLElement>("[data-client-nav]");
  const back = phone.querySelector<HTMLButtonElement>("[data-back]");
  const next = phone.querySelector<HTMLButtonElement>("[data-next]");
  const nextLabel = phone.querySelector<HTMLElement>("[data-next-label]");

  if (nav) nav.hidden = step === "booked";
  if (back) back.hidden = step === "professional";
  if (next) {
    next.disabled =
      (step === "professional" && !state.professionalId) ||
      (step === "service" && !state.serviceId) ||
      (step === "slot" && (!available || !state.slot));
  }
  if (nextLabel) nextLabel.textContent = STEP_LABEL[step] ?? "Continuar";

  const cancelled = state.phase === "cancelled";
  const confirmed =
    state.phase === "confirmed" ||
    (state.phase === "done" && state.branch === "confirm");

  setText(
    phone,
    "[data-success-title]",
    cancelled ? "Horário cancelado" : "Agendamento confirmado!",
  );
  setText(
    phone,
    "[data-success-sub]",
    cancelled
      ? `O horário das ${state.slot} foi liberado. Nenhum valor foi cobrado.`
      : "Você receberá uma confirmação no WhatsApp.",
  );

  const iconCheck = phone.querySelector<HTMLElement>("[data-success-icon-check]");
  const iconCalendar = phone.querySelector<HTMLElement>("[data-success-icon-calendar]");
  if (iconCheck) iconCheck.hidden = cancelled;
  if (iconCalendar) iconCalendar.hidden = !cancelled;

  setText(phone, "[data-summary-pro]", snapshot.professional.name);
  setText(phone, "[data-summary-service]", snapshot.service.name);
  setText(phone, "[data-summary-date]", TENANT.dateLong);
  setText(phone, "[data-summary-time]", state.slot);
  setText(phone, "[data-summary-price]", formatBRL(snapshot.service.price));

  const cancelBadge = phone.querySelector<HTMLElement>("[data-cancel-badge]");
  const doneNote = phone.querySelector<HTMLElement>("[data-done-note]");
  const confirmedNote = phone.querySelector<HTMLElement>("[data-confirmed-note]");
  const cancelNote = phone.querySelector<HTMLElement>("[data-cancel-note]");

  if (cancelBadge) cancelBadge.hidden = !cancelled;
  if (doneNote) doneNote.hidden = cancelled || confirmed;
  if (confirmedNote) confirmedNote.hidden = !confirmed;
  if (cancelNote) cancelNote.hidden = !cancelled;

  const wa = root.querySelector<HTMLElement>("[data-wa]");
  if (wa) {
    wa.hidden = state.phase !== "reminder";
    setText(wa, "[data-wa-service]", snapshot.service.name.toLowerCase());
    setText(wa, "[data-wa-time]", state.slot.replace(":", "h"));
    setText(wa, "[data-wa-pro]", snapshot.professional.name);
  }
}

function renderTimeline(owner: HTMLElement, snapshot: SandboxSnapshot): void {
  const timeline = owner.querySelector<HTMLOListElement>("[data-timeline]");
  if (!timeline) return;

  timeline
    .querySelectorAll("[data-gap-row], [data-booking-row]")
    .forEach((row) => row.remove());

  const insert = (row: HTMLElement, time: string): void => {
    row.dataset.time = time;
    const next = Array.from(
      timeline.querySelectorAll<HTMLElement>("li[data-time]"),
    ).find((item) => (item.dataset.time ?? "") > time);
    if (next) timeline.insertBefore(row, next);
    else timeline.appendChild(row);
  };

  if (snapshot.isGap) {
    const template = owner.querySelector<HTMLTemplateElement>("[data-gap-template]");
    const source = template?.content.firstElementChild;
    if (source) {
      const row = source.cloneNode(true) as HTMLElement;
      row.dataset.pro = snapshot.professional.name;
      setText(row, "[data-gap-time]", snapshot.state.slot);
      setText(
        row,
        "[data-gap-title]",
        `${snapshot.service.duration} min livres`,
      );
      setText(
        row,
        "[data-gap-range]",
        `${snapshot.state.slot}–${addMinutes(
          snapshot.state.slot,
          snapshot.service.duration,
        )}`,
      );
      const fill = row.querySelector<HTMLButtonElement>("[data-gap-fill]");
      if (fill) {
        const waiting = snapshot.queue.some((entry) => !entry.called);
        fill.textContent = waiting ? "Encaixar 1º da fila" : "Encaixar";
        fill.hidden = !waiting;
      }
      insert(row, snapshot.state.slot);
      requestAnimationFrame(() => row.classList.add("is-enter"));
    }
  }

  if (snapshot.booking) {
    const booking = snapshot.booking;
    const template = owner.querySelector<HTMLTemplateElement>("[data-booking-template]");
    const source = template?.content.firstElementChild;
    if (source) {
      const row = source.cloneNode(true) as HTMLElement;
      row.dataset.pro = booking.professional;
      setText(row, "[data-row-time]", booking.time);
      setText(row, "[data-row-client]", booking.client);
      setText(row, "[data-row-service]", booking.service);
      setText(row, "[data-row-pro]", booking.professional);
      setText(row, "[data-row-price]", formatBRL(booking.price));
      setText(row, "[data-row-status]", "Confirmado");
      insert(row, booking.time);
      requestAnimationFrame(() => row.classList.add("is-enter"));
    }
  }
}

function renderOwner(
  owner: HTMLElement,
  snapshot: SandboxSnapshot,
  activeFilter: string,
): void {
  owner.dataset.proFilter = activeFilter;

  const metrics: Array<[string, string]> = [
    ["completed", `${snapshot.metrics.completed}/${snapshot.metrics.total}`],
    ["received", formatBRL(snapshot.metrics.received)],
    ["toReceive", formatBRL(snapshot.metrics.toReceive)],
  ];

  for (const [key, value] of metrics) {
    const el = owner.querySelector<HTMLElement>(`[data-metric="${key}"]`);
    if (!el) continue;
    if (el.textContent !== value) {
      el.textContent = value;
      if (el.dataset.ready === "true") {
        el.classList.remove("is-pulse");
        void el.offsetWidth;
        el.classList.add("is-pulse");
        window.setTimeout(() => el.classList.remove("is-pulse"), 900);
      }
    }
    el.dataset.ready = "true";
  }

  const waiting = snapshot.queue.filter((entry) => !entry.called);
  setText(owner, "[data-queue-count]", String(waiting.length));

  snapshot.queue.forEach((entry) => {
    const row = owner.querySelector<HTMLElement>(
      `[data-queue-row="${entry.id}"]`,
    );
    if (!row) return;
    row.hidden = entry.called;

    const wait = row.querySelector<HTMLElement>("[data-queue-wait]");
    if (wait) {
      wait.textContent = entry.wait === 0 ? "agora" : `há ${entry.wait} min`;
      wait.classList.remove("is-ok", "is-warn", "is-danger");
      wait.classList.add(
        entry.wait < 15 ? "is-ok" : entry.wait < 30 ? "is-warn" : "is-danger",
      );
    }

    const pref = row.querySelector<HTMLElement>("[data-queue-pref]");
    if (pref) pref.textContent = entry.preference;
  });

  owner.querySelectorAll<HTMLElement>("[data-action=filter]").forEach((button) => {
    const active = button.dataset.value === activeFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  renderTimeline(owner, snapshot);
}

function renderChapters(root: HTMLElement, snapshot: SandboxSnapshot): void {
  root.querySelectorAll<HTMLElement>("[data-chapter]").forEach((button) => {
    const id = Number(button.dataset.chapter);
    const active = id === snapshot.chapter;
    button.classList.toggle("is-active", active);
    button.classList.toggle("is-done", id < snapshot.chapter);
    if (active) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });

  const confirmed =
    snapshot.state.phase === "confirmed" ||
    (snapshot.state.phase === "done" && snapshot.state.branch === "confirm");
  const fourth = root.querySelector<HTMLElement>('[data-chapter="4"]');
  const fourthTitle = fourth?.querySelector<HTMLElement>("[data-chapter-title]");
  const fourthDesc = fourth?.querySelector<HTMLElement>("[data-chapter-desc]");
  if (fourthTitle) {
    fourthTitle.textContent = confirmed ? "Cadeira garantida" : "A fila preenche";
  }
  if (fourthDesc) {
    fourthDesc.textContent = confirmed
      ? "O lembrete fez o trabalho: sem ligação, sem brecha."
      : "A brecha não fica vazia: o próximo da fila entra no lugar.";
  }
}

function renderOutcome(root: HTMLElement, snapshot: SandboxSnapshot): void {
  const outcome = root.querySelector<HTMLElement>("[data-outcome]");
  if (!outcome) return;

  const phase = snapshot.state.phase;
  const visible = phase === "filled" || phase === "done" || phase === "confirmed";
  outcome.hidden = !visible;
  if (!visible) return;

  const confirmed = snapshot.state.branch === "confirm";
  const recovered = snapshot.booking?.price ?? snapshot.service.price;

  setText(outcome, "[data-outcome-kicker]", confirmed ? "Sem brecha" : "Simulação concluída");
  setText(
    outcome,
    "[data-outcome-title]",
    confirmed ? "Ela confirmou. Cadeira garantida." : "Um cancelamento. Zero cadeira vazia.",
  );
  setText(
    outcome,
    "[data-outcome-text]",
    confirmed
      ? "O lembrete chegou às 14:00 e a Mariana confirmou com um toque. Sem ligação, sem brecha, sem correria."
      : "Marcos entrou no lugar da Mariana às 15:00. A cadeira do Bruno continuou cheia e a comissão do dia também.",
  );

  const chips = outcome.querySelectorAll<HTMLElement>("[data-outcome-chip]");
  const values = confirmed
    ? [
        `${formatBRL(snapshot.service.price)} confirmados`,
        `${snapshot.metrics.total} atendimentos`,
        "0 ligações",
      ]
    : [
        `${formatBRL(recovered)} recuperados`,
        "1 vaga preenchida",
        "0 cadeira vazia",
      ];
  chips.forEach((chip, index) => {
    chip.textContent = values[index] ?? "";
  });

  const alt = outcome.querySelector<HTMLElement>("[data-outcome-alt]");
  if (alt) {
    alt.textContent = confirmed ? "Ver o caminho do cancelamento" : "Ver o lembrete de novo";
    alt.dataset.value = "2";
  }
}

function renderLive(root: HTMLElement, snapshot: SandboxSnapshot): void {
  const live = root.querySelector<HTMLElement>("[data-live]");
  if (!live) return;

  const state = snapshot.state;
  let message = "Escolha um profissional para começar.";
  switch (state.phase) {
    case "service":
      message = "Escolha um serviço.";
      break;
    case "slot":
      message = "Escolha um horário.";
      break;
    case "booked":
      message = `Agendamento confirmado para as ${state.slot} com ${snapshot.professional.name}.`;
      break;
    case "reminder":
      message = "Lembrete enviado no WhatsApp. Mariana pode confirmar ou cancelar.";
      break;
    case "cancelled":
      message = `Mariana cancelou. A vaga das ${state.slot} está livre.`;
      break;
    case "confirmed":
      message = "Mariana confirmou. A cadeira está garantida.";
      break;
    case "filled":
      message = `${snapshot.booking?.client ?? "O próximo da fila"} foi encaixado às ${state.slot}. A vaga foi preenchida.`;
      break;
    case "done":
      message = "Simulação concluída.";
      break;
  }

  if (live.textContent !== message) live.textContent = message;
}

function renderControl(
  root: HTMLElement,
  snapshot: SandboxSnapshot,
  reduced: boolean,
): void {
  const label = root.querySelector<HTMLElement>("[data-control-label]");
  if (!label) return;

  const state = snapshot.state;
  const message = reduced
    ? "Demonstração manual — use os capítulos."
    : state.phase === "done" || state.phase === "confirmed"
      ? "Fim da simulação — toque em Ver de novo."
      : state.takenOver
        ? "Você está no controle — use os capítulos ou o celular."
        : "Demonstração automática — toque para assumir.";

  if (label.textContent !== message) label.textContent = message;

  if (reduced) {
    const stage = root.querySelector<HTMLElement>("[data-stage]");
    if (stage) stage.dataset.autoplay = "off";
  }
}

function renderTabs(root: HTMLElement, snapshot: SandboxSnapshot): void {
  root.querySelectorAll<HTMLElement>("[data-action=view]").forEach((button) => {
    const active = button.dataset.value === snapshot.state.view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
}

function renderStage(root: HTMLElement, snapshot: SandboxSnapshot): void {
  const state = snapshot.state;
  const autoplay = state.autoplay ? "on" : "off";

  root.dataset.phase = state.phase;
  root.dataset.view = state.view;
  root.dataset.autoplay = autoplay;
  root.dataset.branch = state.branch ?? "";

  const stage = root.querySelector<HTMLElement>("[data-stage]");
  if (stage) {
    stage.dataset.phase = state.phase;
    stage.dataset.view = state.view;
    stage.dataset.autoplay = autoplay;
    stage.dataset.branch = state.branch ?? "";
  }

  const phone = root.querySelector<HTMLElement>("[data-phone]");
  if (phone) phone.dataset.view = state.view;
}

export function initSandbox(root: HTMLElement): void {
  if (root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  const store = createSandbox();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timers: number[] = [];
  let started = false;
  let activeFilter = "all";

  const clearTimers = (): void => {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
  };

  const applyFilter = (): void => {
    root.querySelectorAll<HTMLElement>("[data-owner]").forEach((owner) => {
      owner.dataset.proFilter = activeFilter;
    });
    root.querySelectorAll<HTMLElement>("[data-action=filter]").forEach((button) => {
      const active = button.dataset.value === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const takeOver = (): void => {
    if (store.getState().takenOver) return;
    clearTimers();
    store.takeOver();
  };

  const startAutoplay = (): void => {
    if (reduced) return;
    clearTimers();
    timers = [
      window.setTimeout(() => store.toClient(), 1200),
      window.setTimeout(() => store.selectProfessional("bruno"), 1800),
      window.setTimeout(() => store.selectService("corte"), 2700),
      window.setTimeout(() => store.selectSlot("15:00"), 3600),
      window.setTimeout(() => store.toOwner(), 4800),
      window.setTimeout(() => store.remind(), 7000),
      window.setTimeout(() => store.choose("cancel"), 10000),
      window.setTimeout(() => store.fill(), 12000),
      window.setTimeout(() => store.finish(), 13800),
    ];
  };

  const restart = (): void => {
    clearTimers();
    activeFilter = "all";
    store.reset();
    applyFilter();
    if (!reduced) {
      started = true;
      startAutoplay();
    }
  };

  const restartClient = (): void => {
    clearTimers();
    activeFilter = "all";
    store.reset();
    store.takeOver();
    applyFilter();
  };

  const render = (snapshot: SandboxSnapshot): void => {
    renderStage(root, snapshot);
    renderTabs(root, snapshot);
    renderClient(root, snapshot);
    root.querySelectorAll<HTMLElement>("[data-owner]").forEach((owner) => {
      renderOwner(owner, snapshot, activeFilter);
    });
    renderChapters(root, snapshot);
    renderOutcome(root, snapshot);
    renderLive(root, snapshot);
    renderControl(root, snapshot, reduced);
  };

  root.addEventListener("pointerdown", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;
    if (target.dataset.action === "reset" || target.dataset.action === "restart-client") {
      return;
    }
    takeOver();
  });

  root.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
    if (!target) return;

    const action = target.dataset.action;
    const value = target.dataset.value ?? "";

    switch (action) {
      case "professional":
        takeOver();
        store.selectProfessional(value);
        break;
      case "service":
        takeOver();
        store.selectService(value);
        break;
      case "slot":
        takeOver();
        store.selectSlot(value);
        break;
      case "back":
        takeOver();
        store.back();
        break;
      case "next": {
        takeOver();
        const state = store.getState();
        if (state.phase === "professional" && state.professionalId) {
          store.selectProfessional(state.professionalId);
        } else if (state.phase === "service" && state.serviceId) {
          store.selectService(state.serviceId);
        } else if (state.phase === "slot") {
          store.selectSlot(state.slot);
        }
        break;
      }
      case "to-owner":
        takeOver();
        store.toOwner();
        break;
      case "view":
        takeOver();
        if (value === "owner") store.toOwner();
        else store.toClient();
        break;
      case "confirm":
        store.choose("confirm");
        break;
      case "cancel":
        store.choose("cancel");
        break;
      case "fill":
        takeOver();
        store.fill(target.dataset.queueCall);
        break;
      case "chapter":
        takeOver();
        store.jump(Number(value));
        break;
      case "filter":
        activeFilter = value;
        applyFilter();
        render(store.getSnapshot());
        break;
      case "restart-client":
        restartClient();
        break;
      case "reset":
        restart();
        break;
    }
  });

  store.subscribe(render);

  const stage = root.querySelector<HTMLElement>("[data-stage]");
  if (stage && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          if (!reduced && !store.getState().takenOver) startAutoplay();
          observer.disconnect();
        }
      },
      { threshold: 0.22 },
    );
    observer.observe(stage);
  }

  if (!document.documentElement.dataset.sandboxJumpBound) {
    document.documentElement.dataset.sandboxJumpBound = "true";
    document.addEventListener("click", (event) => {
      const trigger = (event.target as HTMLElement)?.closest<HTMLElement>(
        "[data-jump-chapter]",
      );
      if (!trigger) return;
      const chapter = Number(trigger.dataset.jumpChapter);
      if (!chapter) return;
      event.preventDefault();
      takeOver();
      store.jump(chapter);
      root.querySelector("#capitulos")?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "start",
      });
    });
  }
}
