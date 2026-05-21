resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "report_storage" {
  bucket        = "team-report-storage-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "report_storage_block" {
  bucket = aws_s3_bucket.report_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
