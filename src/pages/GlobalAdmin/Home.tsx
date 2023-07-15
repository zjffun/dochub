import { runSetDocProgressTask } from "../../api/admin";

export default function Home() {
  function callSetDocProgress() {
    runSetDocProgressTask();
  }

  return (
    <section>
      <ul>
        <li>
          <button onClick={callSetDocProgress}>Call setDocProgress</button>
        </li>
      </ul>
    </section>
  );
}
