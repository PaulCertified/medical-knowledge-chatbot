terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# IAM user for the application
resource "aws_iam_user" "app_user" {
  name = "medical-chatbot-app"
}

# Policy for application access to Bedrock
resource "aws_iam_user_policy" "app_policy" {
  name = "medical-chatbot-app-policy"
  user = aws_iam_user.app_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:ListFoundationModels"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "es:ESHttp*"
        ]
        Resource = "arn:aws:es:${var.aws_region}:${data.aws_caller_identity.current.account_id}:domain/medical-knowledge/*"
      }
    ]
  })
}

# Create access key for the application user
resource "aws_iam_access_key" "app_access_key" {
  user = aws_iam_user.app_user.name
}

# Output the access key details (sensitive)
output "app_access_key_id" {
  value = aws_iam_access_key.app_access_key.id
}

output "app_secret_access_key" {
  value     = aws_iam_access_key.app_access_key.secret
  sensitive = true
}

# IAM role for the HIPAA chatbot service
resource "aws_iam_role" "hipaa_chatbot_role" {
  name = "hipaa_chatbot_service_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for Bedrock access
resource "aws_iam_role_policy" "bedrock_policy" {
  name = "bedrock_access_policy"
  role = aws_iam_role.hipaa_chatbot_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel",
          "bedrock:ListFoundationModels"
        ]
        Resource = "*"
      }
    ]
  })
}

# Policy for DynamoDB access
resource "aws_iam_role_policy" "dynamodb_policy" {
  name = "dynamodb_access_policy"
  role = aws_iam_role.hipaa_chatbot_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.chat_sessions.arn,
          aws_dynamodb_table.chat_messages.arn,
          aws_dynamodb_table.user_data.arn
        ]
      }
    ]
  })
}

# DynamoDB Tables
resource "aws_dynamodb_table" "chat_sessions" {
  name           = "${var.table_prefix}chat_sessions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "sessionId"
  range_key      = "userId"
  
  attribute {
    name = "sessionId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Service     = "HIPAA-Chatbot"
  }
}

resource "aws_dynamodb_table" "chat_messages" {
  name           = "${var.table_prefix}chat_messages"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "messageId"
  range_key      = "sessionId"

  attribute {
    name = "messageId"
    type = "S"
  }

  attribute {
    name = "sessionId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  global_secondary_index {
    name               = "SessionTimestampIndex"
    hash_key           = "sessionId"
    range_key          = "timestamp"
    projection_type    = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Service     = "HIPAA-Chatbot"
  }
}

resource "aws_dynamodb_table" "user_data" {
  name           = "${var.table_prefix}user_data"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Environment = var.environment
    Service     = "HIPAA-Chatbot"
  }
}

# KMS key for encryption
resource "aws_kms_key" "hipaa_encryption_key" {
  description             = "KMS key for HIPAA-compliant data encryption"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      }
    ]
  })

  tags = {
    Environment = var.environment
    Service     = "HIPAA-Chatbot"
  }
} 