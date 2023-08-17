import { DocumentOwner } from './entity/document-owner.entity';
import { editFileName, fileLocation } from './entity/file-upload.utils';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { Crud, CrudController, ParsedRequest, CrudRequest } from '@nestjsx/crud';
import { Documents } from './entity/document.entity';
import { Controller, Post, UploadedFile, UseInterceptors, Body, Param, Req, Get, StreamableFile, Res, UseGuards, Query } from '@nestjs/common';
import { assert, log } from 'console';
import { join } from 'path';
import { createReadStream } from 'fs';
import { AuditDto } from 'src/audit_/dto/audit-dto';
import { AuditService } from 'src/audit_/audit.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TokenDetails, TokenReqestType } from 'src/utills/token_details';
import { diskStorage } from 'multer';
var multer = require('multer')
//var upload = multer({ dest: './public/data/uploads/' })


@Crud({
    model: {
        type: Documents,
    }
})

@UseGuards(JwtAuthGuard)
@Controller('document')
export class DocumentController implements CrudController<Documents> {
    constructor(
        public service: DocumentService,
        private readonly auditService: AuditService,
        private readonly tokenDetails: TokenDetails,
    ) {
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: './public',
            filename: editFileName,
        })

    }))
    uploadFile(@UploadedFile() file, @Req() req: CrudRequest) {
        console.log(file)
        if(file){
            let doc = new Documents();
            doc.fileName = file.originalname;
            doc.mimeType = file.mimetype;
            doc.relativePath = '/'+ file.path.split('/')[1];
            return this.service.saveDocument(doc);
        }else{
            return null;
        }
    }


    // @UseGuards(JwtAuthGuard)
    // @Post('upload2/:oid/:owner')
    // @UseInterceptors(FileInterceptor("file", {
    //     storage: multer.diskStorage({
    //         destination: fileLocation,
    //         filename: editFileName,
    //     })

    // }))
    // async uploadFile2(@UploadedFile() file, @Req() req: CrudRequest, @Param("oid") oid, @Param("owner") owner) {

    //     var docowner: DocumentOwner = (<any>DocumentOwner)[owner];
    //     let path = join(owner, oid, file.filename)
    //     let doc = new Documents();
    //     // doc.documentOwnerId = oid;
    //     // doc.documentOwner = docowner;
    //     doc.fileName = file.originalname;
    //     doc.mimeType = file.mimetype;
    //     doc.relativePath = path;
    //     // `${docowner}/${oid}/${file.originalname}`;
    //     console.log('********upload2*********')
    //     let audit: AuditDto = new AuditDto();
    //     audit.action = file.originalname + ' Uploaded';
    //     audit.comment = 'Document Uploaded';
    //     audit.actionStatus = 'Uploaded';

    //     this.auditService.create(audit);

    //     let countryIdFromTocken: number;
    //     [countryIdFromTocken] = this.tokenDetails.getDetails([TokenReqestType.countryId])

    //     var newdoc = this.service.saveDocument(doc);
    // }

    // @Post('upload3/:oid')
    // @UseInterceptors(FileInterceptor('file'))
    // uploadFile3(@UploadedFile() file, @Param("oid") oid) {
    //     console.log('********upload3*********')

    // }

    @UseGuards(JwtAuthGuard)
    @Post('delete/:docId')
    async deleteDoc(@Param("docId") docId: number) {
        console.log('********delete*********')
        let audit: AuditDto = new AuditDto();
        audit.action = 'Document Deleted';
        audit.comment = 'Document Deleted';
        audit.actionStatus = 'Deleted';

        this.auditService.create(audit);

        return await this.service.deleteDocument(docId);
    }
    @UseGuards(JwtAuthGuard)
    @Get('getDocument/:oid/:owner')
    async getDocuments(@Param("oid") oid: number, @Param("owner") owner: DocumentOwner) {
        var docowner: DocumentOwner = (<any>DocumentOwner)[owner];

        let countryIdFromTocken: number;
        [countryIdFromTocken] = this.tokenDetails.getDetails([TokenReqestType.countryId])

        return await this.service.getDocuments(oid, docowner, countryIdFromTocken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('getDocumentsForViweCountry')
    async getDocumentsForViweCountry(@Query("oid") oid: number) {

        console.log('work', oid)
        let countryIdFromTocken: number;
        [countryIdFromTocken] = this.tokenDetails.getDetails([TokenReqestType.countryId])

        return await this.service.getDocumentsForViweCountry(oid, countryIdFromTocken);
    }
    @Get('downloadDocument/:state/:did')
    async downloadDocuments(@Res({ passthrough: true }) res, @Param("did") did: number, @Param("state") state: string): Promise<StreamableFile> {
        let doc: Documents = await this.service.getDocument(did);


        //   state must be inline or attachment

        res.set({
            'Content-Type': `${doc.mimeType}`,
            'Content-Disposition': `${state}; filename=${doc.fileName}`
        })

        const file = createReadStream(`./static-files/${doc.relativePath}`);

        return new StreamableFile(file);
    }
}
