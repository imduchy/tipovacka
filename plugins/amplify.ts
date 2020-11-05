import Vue from 'vue'
import Amplify from '@aws-amplify/core'
import { AmplifyPlugin } from 'aws-amplify-vue'
import awsExports from '../aws-exports'
Amplify.configure({ ...awsExports, ssr: true })

Vue.use(AmplifyPlugin, Amplify)
