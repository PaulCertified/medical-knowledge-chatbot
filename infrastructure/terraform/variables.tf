variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
  default     = "dev"
}

variable "table_prefix" {
  description = "Prefix for DynamoDB table names"
  type        = string
  default     = "hipaa_chatbot_"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "HIPAA-Chatbot"
    ManagedBy   = "Terraform"
    Environment = "dev"
  }
} 