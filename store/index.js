import * as Sentry from '@sentry/browser'

const STORAGE_KEYS = {
  HEALTH_DECLA_INFO: 'summit2020_health_declaration_info',
  LAST_HEALTH_KEY: 'summit2020_last_health_declaration_key'
}

export const STATES = {
  PAGE_WIDTH: 'pageWidth',
  AGENDA_QUERY: 'agendaQuery',
  AGENDA_FILTER: 'agendaFilter',

  HEALTH_DECLA_INFO: 'healthDeclaInfo',
  LAST_HEALTH_KEY: 'lastHeathKey'
}

export const MUTATIONS = {
  SET_PAGE_WIDTH: 'setPageWidth',
  SET_AGENDA_QUERY: 'setAgendaQuery',
  SET_AGENDA_FILTER: 'setAgendaFilter',
  RESET_AGENDA_SEARCH: 'resetAgendaSearch',

  DECLARE_HEALTH: 'declareHealth',
  INIT_HEALTH: 'initHealth'
}

export const GETTERS = {
  CUR_HEALTH_INFO: 'curHealthInfo',
  ALLOW_CHECK_IN: 'allowCheckIn'
}

export const state = () => {
  return {
    [STATES.PAGE_WIDTH]: '0px',
    [STATES.AGENDA_QUERY]: '',
    [STATES.AGENDA_FILTER]: {},

    [STATES.HEALTH_DECLA_INFO]: {},
    [STATES.LAST_HEALTH_KEY]: ''
  }
}

export const mutations = {
  [MUTATIONS.SET_PAGE_WIDTH] (state, width) {
    state[STATES.PAGE_WIDTH] = width
  },
  [MUTATIONS.SET_AGENDA_QUERY] (state, query) {
    state[STATES.AGENDA_QUERY] = query
  },
  [MUTATIONS.SET_AGENDA_FILTER] (state, filter) {
    state[STATES.AGENDA_FILTER] = filter
  },
  [MUTATIONS.RESET_AGENDA_SEARCH] (state) {
    state[STATES.AGENDA_QUERY] = ''
    state[STATES.AGENDA_FILTER] = {}
  },

  [MUTATIONS.DECLARE_HEALTH] (state, { hashKey, meta }) {
    state[STATES.HEALTH_DECLA_INFO][hashKey] = meta
    state[STATES.LAST_HEALTH_KEY] = hashKey
    // TODO: remove this after event is over
    localStorage.setItem(
      STORAGE_KEYS.HEALTH_DECLA_INFO,
      JSON.stringify(state[STATES.HEALTH_DECLA_INFO])
    )
    localStorage.setItem(
      STORAGE_KEYS.LAST_HEALTH_KEY,
      hashKey
    )
  },
  [MUTATIONS.INIT_HEALTH] (state, { info, lastKey }) {
    state[STATES.HEALTH_DECLA_INFO] = info
    state[STATES.LAST_HEALTH_KEY] = lastKey
  }
}

export const actions = {
  nuxtClientInit ({ commit }) {
    let healthDeclaInfo = {}
    const healthDeclaStr = localStorage.getItem(STORAGE_KEYS.HEALTH_DECLA_INFO)
    try {
      if (healthDeclaStr) {
        healthDeclaInfo = JSON.parse(healthDeclaStr)
      }
    } catch (err) {
      Sentry.captureException(`Invalid health decla: ${healthDeclaStr}`)
    }

    const lastHealthKey = localStorage.getItem(STORAGE_KEYS.LAST_HEALTH_KEY) || ''
    commit(MUTATIONS.INIT_HEALTH, {
      info: healthDeclaInfo,
      lastKey: lastHealthKey
    })
  }
}

export const getters = {
  [GETTERS.CUR_HEALTH_INFO] (state) {
    const key = state[STATES.LAST_HEALTH_KEY]
    const info = state[STATES.HEALTH_DECLA_INFO]
    if (!key || !info) {
      return null
    }
    return info[key] || null
  },
  [GETTERS.ALLOW_CHECK_IN] (state) {
    // TODO: add time based rule
    // disable checkin from production for now
    return !process.env.SITE_BASE.endsWith('/2020')
  }
}
