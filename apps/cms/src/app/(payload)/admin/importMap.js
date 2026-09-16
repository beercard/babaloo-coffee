import { RowLabel as RowLabel_d0cb7904af756538d0e69f8212ab11a8 } from '../../../components/RowLabels'
import { BlockLabel as BlockLabel_d0cb7904af756538d0e69f8212ab11a8 } from '../../../components/RowLabels'
import { ColorField as ColorField_b786b405fcd9412302ce8d29e6c441af } from '../../../components/ColorField'
import { FolderTableCell as FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'
import { FolderField as FolderField_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'
import { SubmissionFields as SubmissionFields_6220cb454b90ba75f94742ee9d2448a6 } from '../../../components/SubmissionFields'
import { FormsStatus as FormsStatus_5731c941917fc9bd7736c51d11f844c8 } from '../../../components/FormsStatus'
import { Icon as Icon_a02a4abfb5c9da17149cbadc8057c129 } from '../../../components/Icon'
import { Logo as Logo_919492c8e60179286a0f183c0a5b652e } from '../../../components/Logo'
import { HeaderActions as HeaderActions_baad58540feb60629bcd8b504efb51d5 } from '../../../components/HeaderActions'
import { NavFooter as NavFooter_24e338004e50bbd816e1fc45305ee36d } from '../../../components/NavFooter'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e } from '@payloadcms/storage-vercel-blob/client'
import { Dashboard as Dashboard_9a680279bc487e655cb510fd8d9dadff } from '../../../components/Dashboard'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "/components/RowLabels#RowLabel": RowLabel_d0cb7904af756538d0e69f8212ab11a8,
  "/components/RowLabels#BlockLabel": BlockLabel_d0cb7904af756538d0e69f8212ab11a8,
  "/components/ColorField#ColorField": ColorField_b786b405fcd9412302ce8d29e6c441af,
  "@payloadcms/next/rsc#FolderTableCell": FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
  "@payloadcms/next/rsc#FolderField": FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  "/components/SubmissionFields#SubmissionFields": SubmissionFields_6220cb454b90ba75f94742ee9d2448a6,
  "/components/FormsStatus#FormsStatus": FormsStatus_5731c941917fc9bd7736c51d11f844c8,
  "/components/Icon#Icon": Icon_a02a4abfb5c9da17149cbadc8057c129,
  "/components/Logo#Logo": Logo_919492c8e60179286a0f183c0a5b652e,
  "/components/HeaderActions#HeaderActions": HeaderActions_baad58540feb60629bcd8b504efb51d5,
  "/components/NavFooter#NavFooter": NavFooter_24e338004e50bbd816e1fc45305ee36d,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler": VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e,
  "/components/Dashboard#Dashboard": Dashboard_9a680279bc487e655cb510fd8d9dadff,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}
