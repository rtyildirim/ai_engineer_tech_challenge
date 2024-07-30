# Skyward tech challenge for AI engineer position

This repository is meant to be used as a challenge for AI engineer candidates at Skyward.
You should fork/clone this repository to use as a basis for the challenge.
The challenge

Subject of this challenge is to develop and deploy a simple, but production ready replica of [Perplexity.ai](https://www.perplexity.ai/).

The requirements are as follows:
* Feel free to use any open-source framework : LlamaIndex, LangChain, Haystack, etc.
* Basic UI.
* Any LLM.
* Any Cloud.
* Should be deployable with scripts (IaC)
* Think about scalability and performance.

* Helpers:

- IaC Test account:
  - AWS Free Tier account: <https://aws.amazon.com/free/>
  - Localstack API: <https://localstack.cloud>
- Terraform best practices: <https://cloud.google.com/docs/terraform/best-practices-for-terraform>
- Terraform AWS provider: <https://registry.terraform.io/providers/hashicorp/aws/latest>
- Terraform AWS modules:
  - Load Balancer: <https://registry.terraform.io/modules/terraform-aws-modules/alb/aws/latest>
  - S3: <https://registry.terraform.io/modules/terraform-aws-modules/s3-bucket/aws/latest>
  - RDS cluster: <https://registry.terraform.io/modules/terraform-aws-modules/rds-aurora/aws/latest>
  - VPC: <https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest>
  - Auto Scaling groups: <https://registry.terraform.io/modules/terraform-aws-modules/autoscaling/aws/latest>

Optional:

- Generate documentation for Terraform code (we provide `.terraform-docs.yaml` file): <https://github.com/terraform-docs/terraform-docs>
- Pass Terraform syntax checker and linters (we provide `.tflint.hcl` and `.tfsec.yaml` files):
  - `validate`: <https://developer.hashicorp.com/terraform/cli/commands/validate>
  - `fmt`: <https://developer.hashicorp.com/terraform/cli/commands/fmt>
  - `tflint`: <https://github.com/terraform-linters/tflint>
  - `tfsec`: <https://github.com/aquasecurity/tfsec> (save output, don't fix it!!)
- Create Terraform syntax checker and linters with GitHub Actions
