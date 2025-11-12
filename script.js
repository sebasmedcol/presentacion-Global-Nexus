window.addEventListener("DOMContentLoaded", () => {

  // === SLIDES ===
  const slides = Array.from(document.querySelectorAll(".slide"));
  let currentSlide = 0;

  function showSlide(i) {
    if (i < 0) i = 0;
    if (i > slides.length - 1) i = slides.length - 1;
    slides.forEach(s => {
      s.classList.remove("active");
      s.style.opacity = 0;
    });
    slides[i].classList.add("active");
    setTimeout(() => (slides[i].style.opacity = 1), 50);
    currentSlide = i;
  }

  document.getElementById("next").addEventListener("click", () => showSlide(currentSlide + 1));
  document.getElementById("prev").addEventListener("click", () => showSlide(currentSlide - 1));
  document.getElementById("toggleDemo").addEventListener("click", () => showSlide(3));

  // === DEMO DE PROYECTOS ===
  const sampleProjects = [
    { id: 1, name: "OptiGrid AI", company: "EnerCo", state: "pending", progress: 0, stories: [{ id: 1, done: false }] },
    { id: 2, name: "SmartBilling", company: "EnerCo", state: "approved", progress: 40, stories: [{ id: 1, done: true }, { id: 2, done: false }] },
    { id: 3, name: "LoadPredict", company: "GridLab", state: "inreview", progress: 10, stories: [{ id: 1, done: false }] }
  ];

  let projects = JSON.parse(JSON.stringify(sampleProjects));
  const projectsList = document.getElementById("projectsList");
  const historyTable = document.getElementById("historyTable");

  function renderProjects(filter = "all") {
    projectsList.innerHTML = "";
    historyTable.innerHTML = "";
    const filtered = projects.filter(p => (filter === "all" ? true : p.state === filter));
    filtered.forEach(p => {
      const el = document.createElement("div");
      el.className = "project";
      el.innerHTML = `
        <div class="meta">
          <strong>${escapeHtml(p.name)}</strong>
          <div class="muted">${escapeHtml(p.company)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="progress"><i style="width:${p.progress}%"></i></div>
          <div class="chip small">${p.state}</div>
          <div style="display:flex;gap:8px">
            <button class="chip" onclick="openAssign(${p.id})">Asignar</button>
            <button class="chip" onclick="approveProgress(${p.id})">Aprobar Progreso</button>
            <button class="chip" onclick="returnProject(${p.id})">Devolver</button>
            <button class="chip" onclick="cancelProject(${p.id})">Cancelar</button>
          </div>
        </div>`;
      projectsList.appendChild(el);

      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div>${escapeHtml(p.name)}</div><div>${p.progress}% • ${escapeHtml(p.state)}</div>`;
      historyTable.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // === MODAL INCENTIVOS ===
  const modalBg = document.getElementById("modalBg");
  const closeModal = document.getElementById("closeModal");
  const saveIncentive = document.getElementById("saveIncentive");
  let currentAssignId = null;

  window.openAssign = function (id) {
    currentAssignId = id;
    modalBg.style.display = "flex";
  };

  closeModal.addEventListener("click", () => {
    modalBg.style.display = "none";
  });

  saveIncentive.addEventListener("click", () => {
    const p = projects.find(x => x.id === currentAssignId);
    if (p) {
      p.state = "inreview";
      const tipo = document.getElementById("incentiveType").value;
      const nota = document.getElementById("incentiveNote").value;
      p.incentivo = { tipo, nota };
    }
    modalBg.style.display = "none";
    renderProjects(document.getElementById("filterState").value);
  });

  // === FUNCIONES DE PROYECTOS ===
  window.approveProgress = function (id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    if (p.state === "pending") {
      alert("No se ha enviado solicitud de aprobación de progreso.");
      return;
    }
    const undone = p.stories.find(s => !s.done);
    if (!undone) {
      alert("No hay historias pendientes con evidencia para aprobar.");
      return;
    }
    undone.done = true;
    const doneCount = p.stories.filter(s => s.done).length;
    p.progress = Math.min(100, Math.round((doneCount / p.stories.length) * 100));
    if (p.progress === 100) p.state = "completed";
    renderProjects(document.getElementById("filterState").value);
  };

  window.returnProject = function (id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    p.state = "pending";
    renderProjects(document.getElementById("filterState").value);
  };

  window.cancelProject = function (id) {
    const p = projects.find(x => x.id === id);
    if (!p) return;
    if (p.state === "inreview") {
      alert("No se puede cancelar en estado En Revisión.");
      return;
    }
    const reason = prompt("Justifique la cancelación:");
    if (!reason) {
      alert("La cancelación requiere justificación.");
      return;
    }
    p.state = "cancelled";
    renderProjects(document.getElementById("filterState").value);
  };

  // === CONTROLES ===
  document.getElementById("filterState").addEventListener("change", e => renderProjects(e.target.value));
  document.getElementById("addDemo").addEventListener("click", () => {
    const id = Date.now() % 100000;
    const newP = { id, name: `Demo-${id}`, company: "DemoCo", state: "pending", progress: 0, stories: [{ id: 1, done: false }, { id: 2, done: false }] };
    projects.unshift(newP);
    renderProjects(document.getElementById("filterState").value);
  });
  document.getElementById("resetDemo").addEventListener("click", () => {
    projects = JSON.parse(JSON.stringify(sampleProjects));
    renderProjects();
  });
  document.getElementById("autoAssign").addEventListener("click", () => {
    const pending = projects.filter(p => p.state === "pending");
    pending.forEach((p, i) => {
      if (i < 2) p.state = "inreview";
    });
    alert("Incentivos autosugeridos (demo).");
    renderProjects();
  });

  // === ROADMAP ===
  let currentPhase = 1;
  const totalPhases = 4;
  const progress = document.getElementById("roadmapProgress");
  const desc = document.getElementById("phaseDescription");

  const phaseTexts = {
    1: {
      title: "Fase 1 — Diagnóstico y Comité Estratégico (0–30 días)",
      text: "Se identifican los casos de uso de IA más valiosos para la organización energética. Se conforma el comité de IA con líderes de innovación, TI y operaciones."
    },
    2: {
      title: "Fase 2 — Prototipado y Gobernanza (31–60 días)",
      text: "Desarrollo de pruebas de concepto (PoC) con datos reales. Se establece un pipeline MLOps básico y checklist ético de IA."
    },
    3: {
      title: "Fase 3 — Productización y Escalado (61–90 días)",
      text: "Los modelos de IA se integran a los sistemas productivos. Se crean playbooks y se escalan los casos de éxito."
    },
    4: {
      title: "Fase 4 — Consolidación y Cultura de Incentivos (91–120 días)",
      text: "Se activa el programa formal de incentivos y se consolida una comunidad interna de innovación sostenible."
    }
  };

  document.getElementById("nextPhase").addEventListener("click", () => {
    if (currentPhase < totalPhases) currentPhase++;
    updateRoadmap();
  });

  document.getElementById("resetPhase").addEventListener("click", () => {
    currentPhase = 1;
    updateRoadmap();
  });

  function updateRoadmap() {
    const percent = (currentPhase / totalPhases) * 100;
    progress.style.width = percent + "%";

    const phases = document.querySelectorAll(".phase");
    phases.forEach(p => p.classList.remove("active"));
    for (let i = 0; i < currentPhase; i++) phases[i].classList.add("active");

    desc.innerHTML = `<strong>${phaseTexts[currentPhase].title}</strong><p class='muted'>${phaseTexts[currentPhase].text}</p>`;
  }

  // === INIT ===
  showSlide(0);
  renderProjects();
  updateRoadmap();

});
