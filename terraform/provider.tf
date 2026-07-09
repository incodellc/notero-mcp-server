provider "aws" {
  region                   = var.aws_region
  shared_credentials_files = var.aws_shared_credentials_file != "" ? [var.aws_shared_credentials_file] : null
  profile                  = var.aws_profile != "" ? var.aws_profile : null
}
