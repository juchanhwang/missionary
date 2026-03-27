import { Injectable } from '@nestjs/common';
import { write } from 'fast-csv';

import type {
  MissionaryFormField,
  ParticipationFormAnswer,
} from '../../../prisma/generated/prisma';

interface ParticipationCsvRow {
  name: string;
  birthDate: string;
  affiliation: string | null;
  cohort: number | null;
  attendanceOptionLabel: string | null;
  applyFee: number | null;
  isPaid: boolean;
  isOwnCar: boolean;
  hasPastParticipation: boolean | null;
  isCollegeStudent: boolean | null;
  teamName: string | null;
  createdAt: Date;
  formAnswers: ParticipationFormAnswer[];
}

@Injectable()
export class CsvExportService {
  async generateParticipationCsv(
    participations: ParticipationCsvRow[],
    formFields: MissionaryFormField[] = [],
  ): Promise<Buffer> {
    const fixedHeaders = [
      '이름',
      '생년월일',
      '소속',
      '기수',
      '참석일정',
      '신청비용',
      '납부여부',
      '자차여부',
      '과거참여',
      '대학생여부',
      '팀',
      '등록일시',
    ];

    const dynamicHeaders = formFields
      .sort((a, b) => a.order - b.order)
      .map((f) => f.label);

    const headers = [...fixedHeaders, ...dynamicHeaders];

    const records = participations.map((p) => {
      const fixed: Record<string, string | number> = {
        이름: p.name,
        생년월일: p.birthDate,
        소속: p.affiliation ?? '',
        기수: p.cohort ?? '',
        참석일정: p.attendanceOptionLabel ?? '',
        신청비용: p.applyFee ?? '',
        납부여부: p.isPaid ? '납부완료' : '미납',
        자차여부: p.isOwnCar ? 'Y' : 'N',
        과거참여:
          p.hasPastParticipation === null
            ? ''
            : p.hasPastParticipation
              ? 'Y'
              : 'N',
        대학생여부:
          p.isCollegeStudent === null ? '' : p.isCollegeStudent ? 'Y' : 'N',
        팀: p.teamName ?? '미배정',
        등록일시: p.createdAt.toISOString().split('T')[0],
      };

      const dynamic: Record<string, string> = {};
      for (const field of formFields) {
        const answer = p.formAnswers.find((a) => a.formFieldId === field.id);
        dynamic[field.label] = answer?.value ?? '';
      }

      return { ...fixed, ...dynamic };
    });

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      write(records, {
        headers,
        quoteColumns: true,
      })
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const csvBuffer = Buffer.concat(chunks);
          const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
          resolve(Buffer.concat([BOM, csvBuffer]));
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
