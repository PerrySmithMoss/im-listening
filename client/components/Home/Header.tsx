import Link from "next/link";

export function Header() {
  return (
    <div className="pt-14 xss:pt-16 pb-12 xss:max-w-[90rem] xss:mx-auto">
      <div className="px-4 sm:px-8 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mx-1 xss:mx-20">
          <div className="col-span-6">
            <h1 className="font-bold text-[42px] md:text-6xl max-w-xl leading-tight">
              Listening is <span className="text-brand-orange">everything</span>
            </h1>
            <div className="w-12 h-2 bg-brand-orange rounded-full mt-8" />
            <p className="text-base xss:max-w-[300px] mt-8">
              Share what you&apos;re listening to now.
            </p>
            <Link href="/login" className="inline-block mt-8 xss:text-lg bg-brand-orange px-8 py-2.5 text-white rounded hover:bg-brand-orange_hover">
              Share
            </Link>
          </div>
          <div className="hidden md:block col-span-6 justify-self-end">
            <img src="/assets/home-hero_image1.png" alt="Two people dancing to music" />
          </div>
        </div>
      </div>
    </div>
  );
}
