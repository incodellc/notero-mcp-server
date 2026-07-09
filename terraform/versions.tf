terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment when the shared S3/DynamoDB remote state backend is configured.
  # backend "s3" {
  #   bucket         = "REPLACE_WITH_STATE_BUCKET"
  #   key            = "notero-mcp/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "REPLACE_WITH_LOCK_TABLE"
  #   encrypt        = true
  # }
}
