resource "azapi_resource" "this" {
  name      = "me-${var.project_name}-${var.environment}"
  type      = "Microsoft.App/managedEnvironments@2022-03-01"
  parent_id = azurerm_resource_group.this.id
  location  = var.region
  tags      = local.default_tags

  body = jsonencode({
    properties = {
      appLogsConfiguration = {
        destination = "log-analytics"
        logAnalyticsConfiguration = {
          customerId = azurerm_log_analytics_workspace.this.workspace_id
          sharedKey  = azurerm_log_analytics_workspace.this.primary_shared_key
        }
      }
      zoneRedundant = false
    }
  })
}

resource "azapi_resource" "aca_client_certificate" {
  name      = "me-cert-${var.project_name}-${var.environment}"
  type      = "Microsoft.App/managedEnvironments/certificates@2022-03-01"
  parent_id = azapi_resource.this.id
  location  = var.region
  tags      = local.default_tags

  body = jsonencode({
    properties = {
      password = "GastonLyla69"
      value    = filebase64("./client-cert.pfx")
    }
  })
}

resource "azapi_resource" "aca-api" {
  name      = "aca-${var.project_name}-api-${var.environment}"
  location  = var.region
  parent_id = azurerm_resource_group.this.id
  type      = "Microsoft.App/containerApps@2022-03-01"
  tags      = local.default_tags
  identity {
    type = "SystemAssigned"
  }

  body = jsonencode({
    properties : {
      managedEnvironmentId = azapi_resource.this.id
      configuration = {
        ingress = {
          external      = true
          allowInsecure = false
          targetPort    = 3003
          transport     = "Auto"
          # customDomains = [{
          #   name          = "api.onlinetipovacka.sk"
          #   certificateId = "todo"
          # }]
        }
        registries = [{
          identity = "system"
          server   = azurerm_container_registry.this.login_server
        }]
        secrets = [
          {
            name  = "session-secret"
            value = random_password.session_secret.result
          },
          {
            name  = "admin-token"
            value = random_password.admin_token.result
          }
        ]
      }
      template = {
        containers = [{
          image = "${azurerm_container_registry.this.login_server}/${var.project_name}-api:latest"
          name  = "${var.project_name}-api"
          env = [
            {
              name  = "API_FOOTBALL_HOST"
              value = "v3.football.api-sports.io"
            },
            {
              name  = "API_FOOTBALL_URL"
              value = "https://v3.football.api-sports.io"
            },
            {
              name  = "KEY_VAULT_URL"
              value = azurerm_key_vault.this.vault_uri
            },
            {
              name  = "CONNECTION_STRING_SECRET_NAME"
              value = azurerm_key_vault_secret.db_connection_string.name
            },
            {
              name  = "FOOTBALL_API_KEY_SECRET_NAME"
              value = azurerm_key_vault_secret.football_api_key.name
            },
            {
              name      = "SESSION_SECRET"
              secretRef = "session-secret"
            },
            {
              name      = "API_ADMIN_TOKEN"
              secretRef = "admin-token"
            },
            {
              name  = "NODE_ENV"
              value = "production"
            }
          ]
          resources = {
            cpu    = 0.25
            memory = "0.5Gi"
          }
        }]
        scale = {
          minReplicas = 0
          maxReplicas = 2
        }
      }
    }
  })

  response_export_values = ["properties.configuration.ingress.fqdn"]

  lifecycle {
    # It's not possible to specify properties within the body attribute
    # so we're ignoring all changes. Hopefully this will be solved when
    # terraform's azurerm provider starts supporting Azure Container Apps
    ignore_changes = [
      body
    ]
  }
}

resource "random_password" "session_secret" {
  length  = 12
  special = true
}

resource "random_password" "admin_token" {
  length  = 12
  special = true
}

resource "azapi_resource" "aca-client" {
  name      = "aca-${var.project_name}-client-${var.environment}"
  location  = var.region
  parent_id = azurerm_resource_group.this.id
  type      = "Microsoft.App/containerApps@2022-03-01"
  tags      = local.default_tags
  identity {
    type = "SystemAssigned"
  }

  body = jsonencode({
    properties : {
      managedEnvironmentId = azapi_resource.this.id
      configuration = {
        ingress = {
          external      = true
          allowInsecure = false
          targetPort    = 3000
          transport     = "Auto"
          customDomains = [{
            bindingType   = "Disabled"
            name          = "onlinetipovacka.sk"
            certificateId = azapi_resource.aca_client_certificate.id
          }]
        }
        registries = [{
          identity = "system"
          server   = azurerm_container_registry.this.login_server
        }]
      }
      template = {
        containers = [{
          image = "${azurerm_container_registry.this.login_server}/${var.project_name}-client:daf98f31860b7e1db7b8a1028396cb5387134cb0"
          name  = "${var.project_name}-client"
          env = [
            {
              name  = "BROWSER_BASE_URL"
              value = "https://${jsondecode(azapi_resource.aca-api.output).properties.configuration.ingress.fqdn}"
            },
            {
              name  = "NODE_ENV"
              value = "production"
            }
          ]
          resources = {
            cpu    = 0.25
            memory = "0.5Gi"
          }
        }]
        scale = {
          minReplicas = 0
          maxReplicas = 2
        }
      }
    }
  })

  lifecycle {
    ignore_changes = [
      # It's not possible to specify properties within the body attribute
      # so we're ignoring all changes. Hopefully this will be solved when
      # terraform's azurerm provider starts supporting Azure Container Apps
      body
    ]
  }
}

resource "azapi_update_resource" "update_client" {
  type        = "Microsoft.App/containerApps@2022-06-01-preview"
  resource_id = azapi_resource.aca-client.id

  body = jsonencode({
    template = {
      configuration = {
        ingress = {
          customDomains = [{
            bindingType   = "Disabled"
            name          = "onlinetipovacka.sk"
            certificateId = azapi_resource.aca_client_certificate.id
          }]
        }
      }
    }
  })
}
