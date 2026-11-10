ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

CREATE TABLE "ExternalIdentity" (
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ExternalIdentity_pkey" PRIMARY KEY ("issuer", "subject")
);

CREATE UNIQUE INDEX "ExternalIdentity_userId_issuer_key" ON "ExternalIdentity"("userId", "issuer");
ALTER TABLE "ExternalIdentity" ADD CONSTRAINT "ExternalIdentity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
