Markdown# 🛠️ Mil Oficios Dev — MuchikTec

![MuchikTec](https://img.shields.io/badge/Empresa-MuchikTec-0052CC?style=for-the-badge&logo=building&logoColor=white)
![URL](https://img.shields.io/badge/Dev_Environment-miloficiosdev.muchiktec.com-FF6C37?style=for-the-badge&logo=firefox)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Status](https://img.shields.io/badge/Estado-Desarrollo-orange?style=for-the-badge)

Entorno de desarrollo para la plataforma **Mil Oficios**, un proyecto orientado a conectar técnicos, especialistas y prestadores de servicios con clientes. Este repositorio integra flujos de **CI/CD** con GitHub Actions para automatizar pruebas, análisis de código y despliegues en el servidor de pruebas (`dev`).

---

## 🌐 Enlaces del Proyecto

- 🔗 **Entorno de Desarrollo:** [miloficiosdev.muchiktec.com](https://miloficiosdev.muchiktec.com)
- 🏢 **Organización:** MuchikTec

---

## 📌 Objetivos del Repositorio

- [x] Configuración del proyecto base para el entorno de desarrollo.
- [ ] Implementar pipelines de **CI/CD** para despliegue automático al servidor `miloficiosdev.muchiktec.com`.
- [ ] Automatizar la ejecución de pruebas unitarias e integración en cada `pull_request`.
- [ ] Configurar notificaciones de estado de despliegues.

---

## 📂 Estructura del Proyecto

```text
miloficios-dev/
├── .github/
│   └── workflows/        # Workflows de GitHub Actions (build, test, deploy)
├── src/                  # Código fuente de la aplicación
├── public/               # Archivos estáticos
├── README.md             # Documentación del proyecto
└── .gitignore            # Exclusiones de Git
⚙️ Pasos para empezar (Local)Clonar el repositorio:Bashgit clone [https://github.com/Julio-JFR/Pruebas-GitHub-Actions.git](https://github.com/Julio-JFR/Pruebas-GitHub-Actions.git)
cd Pruebas-GitHub-Actions
Crear una rama para tu feature/fix:Bashgit checkout -b feature/nueva-funcionalidad
Subir los cambios para activar el pipeline de Integración Continua:Bashgit add .
git commit -m "feat: integración con miloficiosdev"
git push origin feature/nueva-funcionalidad
🤖 Workflows de Integración y Despliegue (CI/CD)WorkflowDetonadorAcción / PropósitoCI - Pruebaspull_request a mainValida linters, sintaxis y pasa tests automatizados.CD - Dev Deploypush a mainCompila y despliega los cambios en miloficiosdev.muchiktec.com.🤝 Colaboradores y EquipoJulio Joaquin — Lead Developer / DevOpsEquipo MuchikTec💡 Nota: Para cambios directos en el servidor de desarrollo, asegúrate de pasar todas las validaciones del PR antes de realizar el merge a la rama principal.
---

### ¿Cómo actualizar tu README en GitHub?

Copia este texto en tu archivo `README.md` local y ejecuta:

```bash
git add README.md
git commit -m "docs: actualizar README para miloficiosdev.muchiktec.com"
git push origin main
