resource "azurerm_resource_group" "this" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.region
  tags     = local.default_tags
}

resource "azurerm_container_registry" "this" {
  name                = "cr${var.project_name}shared"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku           = "Basic"
  admin_enabled = false
}

resource "azurerm_log_analytics_workspace" "this" {
  name                = "log-${var.project_name}-shared"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.region
  tags                = local.default_tags

  sku               = "PerGB2018" # Default
  retention_in_days = 30
}

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
        }
        registries = [{
          identity = "system"
          server   = azurerm_container_registry.this.login_server
        }]
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
              name  = "SESSION_SECRET_NAME"
              value = azurerm_key_vault_secret.api_session_secret.name
            },
            {
              name  = "API_ADMIN_TOKEN_SECRET_NAME"
              value = azurerm_key_vault_secret.api_admin_key.name
            },
            {
              name  = "FOOTBALL_API_KEY_SECRET_NAME"
              value = azurerm_key_vault_secret.football_api_key.name
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
    # It's not possible to specify properties within the body attribute
    # so we're ignoring all changes. Hopefully this will be solved when
    # terraform's azurerm provider starts supporting Azure Container Apps
    ignore_changes = [
      # body
    ]
  }
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
        }
        registries = [{
          identity = "system"
          server   = azurerm_container_registry.this.login_server
        }]
      }
      template = {
        containers = [{
          image = "${azurerm_container_registry.this.login_server}/${var.project_name}-client:latest"
          name  = "${var.project_name}-client"
          env   = []
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
      # body
    ]
  }
}
