export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          안녕하세요, <span className="text-blue-600">Next.js</span> 앱입니다!
        </h1>
        <p className="mt-3 text-2xl">프로젝트가 성공적으로 설치되었습니다.</p>
      </main>
    </div>
  );
}
