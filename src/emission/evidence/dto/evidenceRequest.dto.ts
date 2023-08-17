import { EvidenceStatus } from "src/emission/enum/evidence-status.enum";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { EvidenceRequest } from "../entities/evidence-request.entity";

export class EvidenceRequestDto{
    req: EvidenceRequest
    projectId: number
    activityDataId: number
    code: string
}

export class GetRequestsDto{
    parameterId: number
    month: number
    activityDataId: number
    esCode: sourceName
    status?: EvidenceStatus
}

export class ResponseDto{
    requests: EvidenceRequest[]
    isRequested: boolean
    isApproved: boolean
    isRejected: boolean
    isUploaded: boolean
    isReturned: boolean
}

export class UploadDto {
    documentId: number
    evidenceId: number
    comment: string
}

export class UploadResDto{
    status: boolean
    message: string
}

export class EnableVerificationReqDto{
    esCodes: sourceName[]
    projectId: number
}

export class EnableVerificationResDto{
    status: string
    isEnables: boolean
    message: string
}