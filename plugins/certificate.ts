import https from 'https'
import { Plugin } from '@nuxt/types'

const enableSelfSignedCertificate: Plugin = ({ $axios }) => {
  $axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false })
}

export default enableSelfSignedCertificate
