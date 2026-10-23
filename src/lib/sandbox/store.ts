import {
  BASE_AGENDA,
  QUEUE,
  SERVICES,
  professionalById,
  serviceById,
  slotsForService,
  type AgendaItem,
  type Professional,
  type QueueEntry,
  type Service,
} from "@data/sandbox";

export type Phase =
  | "professional"
  | "service"
  | "slot"
  | "booked"
  | "reminder"
  | "cancelled"
  | "confirmed"
  | "filled"
  | "done";

export type SandboxView = "client" | "owner";
export type SandboxBranch = "cancel" | "confirm" | null;
export type ClientStep = "professional" | "service" | "slot" | "booked";

export interface SandboxState {
  phase: Phase;
  professionalId: string;
  serviceId: string;
  slot: string;
  view: SandboxView;
  branch: SandboxBranch;
  filledId: string | null;
  takenOver: boolean;
  autoplay: boolean;
}

export interface SandboxMetrics {
  completed: number;
  total: number;
  received: number;
  toReceive: number;
}

export interface SandboxQueueEntry extends QueueEntry {
  called: boolean;
}

export interface SandboxSnapshot {
  state: SandboxState;
  professional: Professional;
  service: Service;
  clientStep: ClientStep;
  chapter: number;
  hasBooking: boolean;
  isGap: boolean;
  booking: AgendaItem | null;
  agenda: AgendaItem[];
  queue: SandboxQueueEntry[];
  metrics: SandboxMetrics;
}

export interface SandboxStore {
  getState(): SandboxState;
  getSnapshot(): SandboxSnapshot;
  subscribe(listener: (snapshot: SandboxSnapshot) => void): () => void;
  selectProfessional(id: string): void;
  selectService(id: string): void;
  selectSlot(time: string): void;
  toOwner(): void;
  toClient(): void;
  remind(): void;
  choose(branch: "cancel" | "confirm"): void;
  fill(id?: string): void;
  finish(): void;
  reset(): void;
  takeOver(): void;
  jump(chapter: number): void;
  back(): void;
}

function initialState(): SandboxState {
  return {
    phase: "professional",
    professionalId: "",
    serviceId: "",
    slot: "",
    view: "owner",
    branch: null,
    filledId: null,
    takenOver: false,
    autoplay: true,
  };
}

function bookingFor(state: SandboxState): AgendaItem | null {
  if (
    !["booked", "reminder", "confirmed", "filled", "done"].includes(
      state.phase,
    )
  ) {
    return null;
  }

  const isFilled =
    state.phase === "filled" ||
    (state.phase === "done" && state.branch === "cancel");

  if (isFilled) {
    const entry = QUEUE.find((item) => item.id === state.filledId) ?? QUEUE[0];
    const service =
      SERVICES.find((item) => item.name === entry.service) ??
      serviceById("corte");
    return {
      time: state.slot,
      client: entry.name,
      service: entry.service,
      professional: professionalById(state.professionalId).name,
      price: service.price,
      status: "confirmado",
    };
  }

  const service = serviceById(state.serviceId);
  return {
    time: state.slot,
    client: "Mariana Costa",
    service: service.name,
    professional: professionalById(state.professionalId).name,
    price: service.price,
    status: "confirmado",
  };
}

function agendaFor(state: SandboxState): AgendaItem[] {
  const booking = bookingFor(state);
  return [...BASE_AGENDA, ...(booking ? [booking] : [])].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
}

function queueFor(state: SandboxState): SandboxQueueEntry[] {
  const isFilled =
    state.phase === "filled" ||
    (state.phase === "done" && state.branch === "cancel");
  const calledId = isFilled ? state.filledId ?? QUEUE[0].id : null;
  return QUEUE.map((entry) => ({
    ...entry,
    called: entry.id === calledId,
  }));
}

function metricsFor(state: SandboxState): SandboxMetrics {
  const billable = agendaFor(state).filter(
    (item) => item.price > 0 && item.status !== "bloqueio",
  );
  const paid = billable.filter((item) => item.status === "pago");
  return {
    completed: paid.length,
    total: billable.length,
    received: paid.reduce((total, item) => total + item.price, 0),
    toReceive: billable
      .filter((item) => item.status !== "pago")
      .reduce((total, item) => total + item.price, 0),
  };
}

function clientStepFor(state: SandboxState): ClientStep {
  if (
    state.phase === "professional" ||
    state.phase === "service" ||
    state.phase === "slot"
  ) {
    return state.phase;
  }
  return "booked";
}

function chapterFor(state: SandboxState): number {
  if (state.phase === "reminder") return 2;
  if (state.phase === "cancelled" || state.phase === "confirmed") return 3;
  if (state.phase === "filled" || state.phase === "done") return 4;
  return 1;
}

function snapshotOf(state: SandboxState): SandboxSnapshot {
  return {
    state,
    professional: professionalById(state.professionalId),
    service: serviceById(state.serviceId),
    clientStep: clientStepFor(state),
    chapter: chapterFor(state),
    hasBooking: clientStepFor(state) === "booked",
    isGap: state.phase === "cancelled",
    booking: bookingFor(state),
    agenda: agendaFor(state),
    queue: queueFor(state),
    metrics: metricsFor(state),
  };
}

export function createSandbox(): SandboxStore {
  let state = initialState();
  const listeners = new Set<(snapshot: SandboxSnapshot) => void>();

  const emit = () => {
    const snapshot = snapshotOf(state);
    listeners.forEach((listener) => listener(snapshot));
  };

  const commit = (next: SandboxState) => {
    state = next;
    emit();
  };

  return {
    getState: () => state,
    getSnapshot: () => snapshotOf(state),
    subscribe(listener) {
      listeners.add(listener);
      listener(snapshotOf(state));
      return () => listeners.delete(listener);
    },

    selectProfessional(id) {
      if (!["professional", "service", "slot"].includes(state.phase)) return;
      commit({
        ...state,
        professionalId: id,
        serviceId: "",
        slot: "",
        phase: "service",
      });
    },

    selectService(id) {
      if (!["service", "slot"].includes(state.phase)) return;
      commit({
        ...state,
        serviceId: id,
        slot: "",
        phase: "slot",
      });
    },

    selectSlot(time) {
      if (state.phase !== "slot") return;
      const service = serviceById(state.serviceId);
      if (!slotsForService(service).includes(time)) return;
      commit({
        ...state,
        slot: time,
        phase: "booked",
        view: "client",
        branch: null,
        filledId: null,
      });
    },

    toOwner() {
      commit({ ...state, view: "owner" });
    },

    toClient() {
      commit({ ...state, view: "client" });
    },

    remind() {
      if (state.phase !== "booked") return;
      commit({
        ...state,
        phase: "reminder",
        view: "client",
        branch: null,
      });
    },

    choose(branch) {
      if (state.phase !== "reminder") return;
      commit({
        ...state,
        phase: branch === "cancel" ? "cancelled" : "confirmed",
        view: "owner",
        branch,
      });
    },

    fill(id) {
      if (state.phase !== "cancelled") return;
      const entry = QUEUE.find((item) => item.id === id) ?? QUEUE[0];
      commit({
        ...state,
        phase: "filled",
        view: "owner",
        branch: "cancel",
        filledId: entry.id,
      });
    },

    finish() {
      if (state.phase !== "filled" && state.phase !== "confirmed") return;
      commit({ ...state, phase: "done", autoplay: false });
    },

    reset() {
      commit(initialState());
    },

    takeOver() {
      commit({ ...state, takenOver: true, autoplay: false });
    },

    jump(chapter) {
      const validSelection =
        state.professionalId &&
        state.serviceId &&
        slotsForService(serviceById(state.serviceId)).length > 0;
      const base = validSelection
        ? state
        : {
            ...state,
            professionalId: "bruno",
            serviceId: "corte",
            slot: "15:00",
          };

      if (chapter === 1) {
        commit({
          ...initialState(),
          view: "client",
          takenOver: true,
          autoplay: false,
        });
        return;
      }
      if (chapter === 2) {
        commit({
          ...base,
          phase: "reminder",
          view: "client",
          branch: null,
          filledId: null,
          takenOver: true,
          autoplay: false,
        });
        return;
      }
      if (chapter === 3) {
        commit({
          ...base,
          phase: "cancelled",
          view: "owner",
          branch: "cancel",
          filledId: null,
          takenOver: true,
          autoplay: false,
        });
        return;
      }
      if (chapter === 4) {
        commit({
          ...base,
          phase: "filled",
          view: "owner",
          branch: "cancel",
          filledId: QUEUE[0].id,
          takenOver: true,
          autoplay: false,
        });
      }
    },

    back() {
      if (state.phase === "service") {
        commit({ ...state, phase: "professional" });
      } else if (state.phase === "slot") {
        commit({ ...state, phase: "service" });
      } else if (state.phase === "booked") {
        commit({ ...state, phase: "slot", view: "client" });
      }
    },
  };
}
