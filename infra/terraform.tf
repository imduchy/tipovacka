terraform {
  required_providers {
    azurerm = {
      version = "3.29.0"
      source  = "hashicorp/azurerm"
    }
    azapi = {
      version = "1.0.0"
      source  = "Azure/azapi"
    }
    azuread = {
      version = "2.30.0"
      source  = "hashicorp/azuread"
    }
    random = {
      version = "3.4.3"
      source  = "hashicorp/random"
    }
  }
}

provider "azurerm" {
  features {}
}
