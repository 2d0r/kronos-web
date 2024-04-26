-- CreateTable
CREATE TABLE "_Subtasks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Subtasks_AB_unique" ON "_Subtasks"("A", "B");

-- CreateIndex
CREATE INDEX "_Subtasks_B_index" ON "_Subtasks"("B");

-- AddForeignKey
ALTER TABLE "_Subtasks" ADD CONSTRAINT "_Subtasks_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Subtasks" ADD CONSTRAINT "_Subtasks_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
