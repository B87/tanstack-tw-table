import type { DataTableI18nAdapter } from "../types";

/**
 * Spanish adapter for DataTable components
 *
 * This adapter provides all Spanish text strings used throughout the data table.
 */
export const esAdapter: DataTableI18nAdapter = {
  table: {
    noResults: "Sin resultados.",
  },

  pagination: {
    rowsSelected: count => {
      if (count === 0) return "Ninguna fila seleccionada";
      if (count === 1) return "1 fila seleccionada";
      return `${count} filas seleccionadas`;
    },
    rowsPerPage: "Filas por página",
    pageOf: (current, total) => `Página ${current} de ${total}`,
    goToFirstPage: "Ir a la primera página",
    goToPreviousPage: "Ir a la página anterior",
    goToNextPage: "Ir a la página siguiente",
    goToLastPage: "Ir a la última página",
  },

  toolbar: {
    filterPlaceholder: title => `Filtrar ${title}...`,
    reset: "Restablecer",
    deleteSelected: count => `Eliminar (${count})`,
  },

  filters: {
    noResults: "No se encontraron resultados.",
    selected: "seleccionado",
    clearFilters: "Limpiar filtros",
  },

  dateFilter: {
    operators: {
      on: "En",
      before: "Antes",
      after: "Después",
      between: "Entre",
    },
    filterType: "Tipo de Filtro",
    startDate: "Fecha de Inicio",
    date: "Fecha",
    endDate: "Fecha de Fin",
    clear: "Limpiar",
    apply: "Aplicar",
    clearFilter: "Limpiar filtro",
  },

  views: {
    views: "Vistas",
    noSavedViews: "No hay vistas guardadas",
    default: "Predeterminada",
    current: name => `Actual: ${name}`,
    saveCurrentView: "Guardar Vista Actual",
    saveViewDialog: {
      title: "Guardar Vista Actual",
      description: "Guarda la configuración actual de filtros, orden y columnas como una vista reutilizable.",
      nameLabel: "Nombre *",
      namePlaceholder: "Ingresa el nombre de la vista",
      descriptionLabel: "Descripción",
      descriptionPlaceholder: "Descripción opcional",
      setAsDefault: "Establecer como vista predeterminada",
      cancel: "Cancelar",
      save: "Guardar Vista",
      nameRequired: "Por favor ingresa un nombre para la vista",
    },
    saved: "Vista guardada exitosamente",
    loaded: name => `Vista cargada: ${name}`,
    deleted: "Vista eliminada exitosamente",
    saveFailed: "Error al guardar la vista",
    deleteFailed: "Error al eliminar la vista",
  },

  errors: {
    retry: "Reintentar",
    somethingWentWrong: "Algo salió mal con la tabla de datos",
    errorDescription:
      "Encontramos un error al renderizar la tabla. Esto podría deberse a datos inválidos o un problema temporal. Por favor intenta de nuevo.",
    errorDetails: "Detalles del Error (Desarrollo)",
    reloadPage: "Recargar Página",
    tryAgain: "Intentar de Nuevo",
  },

  columns: {
    view: "Vista",
    toggleColumns: "Alternar columnas",
  },

  actions: {
    addNew: "Agregar Nuevo",
  },
};
