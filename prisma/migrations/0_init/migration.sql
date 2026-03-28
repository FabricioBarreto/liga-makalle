CREATE TABLE "public"."matches" (
  "id" TEXT NOT NULL,
  "opponent" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "venue" TEXT NOT NULL DEFAULT 'Cancha del Club Social',
  "round" TEXT NOT NULL,
  "isHome" BOOLEAN NOT NULL DEFAULT true,
  "status" "public"."MatchStatus" NOT NULL DEFAULT 'UPCOMING',
  "earlyBirdPrice" DOUBLE PRECISION NOT NULL,
  "matchDayPrice" DOUBLE PRECISION NOT NULL,
  "earlyBirdDeadline" TIMESTAMP(3) NOT NULL,
  "totalCapacity" INTEGER NOT NULL DEFAULT 300,
  "soldTickets" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."tickets" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "buyerEmail" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "isEarlyBird" BOOLEAN NOT NULL DEFAULT false,
  "mpPaymentId" TEXT,
  "mpStatus" TEXT DEFAULT 'pending',
  "qrCode" TEXT NOT NULL,
  "pdfSent" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  "buyerPhone" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."operators" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "pin" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "public"."MatchStatus" AS ENUM ('UPCOMING', 'SOLD_OUT', 'FINISHED', 'CANCELLED');

CREATE UNIQUE INDEX "tickets_mpPaymentId_key" ON "public"."tickets"("mpPaymentId");
CREATE UNIQUE INDEX "tickets_qrCode_key" ON "public"."tickets"("qrCode");
CREATE UNIQUE INDEX "operators_email_key" ON "public"."operators"("email");

ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_matchId_fkey"
  FOREIGN KEY ("matchId") REFERENCES "public"."matches"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;