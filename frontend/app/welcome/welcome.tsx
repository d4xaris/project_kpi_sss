import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[300px] w-full space-y-6 px-4">
            <p className="text-gray-700 dark:text-gray-200 text-center">
              UNO GAME!
            </p> 
        </div>
      </div>
    </main>
  );
}

