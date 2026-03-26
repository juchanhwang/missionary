-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('FULL', 'PARTIAL');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'SELECT', 'DATE');

-- CreateTable
CREATE TABLE "missionary_attendance_option" (
    "id" TEXT NOT NULL,
    "type" "AttendanceType" NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "missionary_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "missionary_attendance_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missionary_form_field" (
    "id" TEXT NOT NULL,
    "field_type" "FormFieldType" NOT NULL,
    "label" TEXT NOT NULL,
    "placeholder" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "options" JSONB,
    "missionary_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "missionary_form_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participation_form_answer" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "participation_id" TEXT NOT NULL,
    "form_field_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "participation_form_answer_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "participation" ADD COLUMN "affiliation" TEXT,
ADD COLUMN "attendance_option_id" TEXT,
ADD COLUMN "cohort" INTEGER,
ADD COLUMN "has_past_participation" BOOLEAN,
ADD COLUMN "is_college_student" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "participation_form_answer_participation_id_form_field_id_key" ON "participation_form_answer"("participation_id", "form_field_id");

-- AddForeignKey
ALTER TABLE "missionary_attendance_option" ADD CONSTRAINT "missionary_attendance_option_missionary_id_fkey" FOREIGN KEY ("missionary_id") REFERENCES "missionary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missionary_form_field" ADD CONSTRAINT "missionary_form_field_missionary_id_fkey" FOREIGN KEY ("missionary_id") REFERENCES "missionary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_attendance_option_id_fkey" FOREIGN KEY ("attendance_option_id") REFERENCES "missionary_attendance_option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation_form_answer" ADD CONSTRAINT "participation_form_answer_participation_id_fkey" FOREIGN KEY ("participation_id") REFERENCES "participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation_form_answer" ADD CONSTRAINT "participation_form_answer_form_field_id_fkey" FOREIGN KEY ("form_field_id") REFERENCES "missionary_form_field"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
