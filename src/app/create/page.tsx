import CreateForm from "../ui/tasks/create-form";
import db from "@/modules/db";

export default async function Page() {
    // const mindsets = ['solve', 'create', 'maintain', 'survive', 'learn', 'play', 'socialise', 'self-care', 'relax'];
    // const statuses = ['to do', 'in progress', 'done'];
    // const mindsets = await db.mindsets.findMany();
    // const statuses = await db.statuses.findMany();

    return (
        <main>
            <h2 className="text-primary text-center"></h2>
            {/* <CreateForm mindsets={mindsets} statuses={statuses}/> */}
        </main>
    )
}