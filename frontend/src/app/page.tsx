import Link from "next/link";
import { BrandLogo } from "@/components/common/brand-logo";
import { MobileNav } from "@/components/landing/mobile-nav";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

// Joins a Vietnamese compound word / phrase with non-breaking spaces so a line never splits it (see docs/ui-guidelines.md).
const keep = (text: string) => text.replaceAll(" ", "\u00a0");

const programs = [
  { icon: "community", title: `${keep("Hoạt động")} nhóm`, text: "Chơi – học có chủ đích, rèn kỹ năng chờ đợi, luân phiên, chia sẻ, giao tiếp và tương tác xã hội." },
  { icon: "spark", title: `Học ${keep("cá nhân 1–1")}`, text: "Đánh giá khả năng của từng trẻ và xây dựng kế hoạch phù hợp về giao tiếp, nhận thức, vận động và tự lập." },
  { icon: "heart", title: `${keep("Vận động")} & ${keep("tự phục vụ")}`, text: "Kết hợp vận động thô, vận động tinh, ăn uống, vệ sinh và nghỉ ngơi để trẻ phát triển toàn diện mỗi ngày." },
];

const navLinks = [
  { href: "#approach", label: `Về ${siteConfig.shortName}` },
  { href: "#programs", label: "Chương trình" },
  { href: "#community", label: "Một ngày tại trung tâm" },
];

const Mark = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    spark: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
    community: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3.4-.6 5.5 1.1 6 4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    sun: <><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></>,
    sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z"/>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
};

const Home = () => <main>
  <a className="skipLink" href="#content">Bỏ qua đến nội dung</a>
  <header className="siteHeader">
    <BrandLogo/>
    <nav aria-label="Điều hướng chính">{navLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
    <div className="headerActions"><Button asChild className="h-11 px-5 font-bold max-[620px]:h-10 max-[620px]:px-3.5"><Link href="/login">Đăng nhập</Link></Button><MobileNav links={navLinks}/></div>
  </header>

  <section className="hero" id="content">
    <div className="heroCopy">
      <div className="eyebrow"><span/><span className="nameFull">{siteConfig.name.replace(/ (\S+)$/, "\u00a0$1")}</span><span className="nameShort">{keep(`Trung tâm ${siteConfig.shortName}`)}</span></div>
      <h1>Mỗi trẻ là một<br/><em>{keep("cá thể")} {keep("đặc biệt.")}</em></h1>
      <p>Với sự kiên nhẫn, yêu thương và thấu hiểu, {siteConfig.shortName} đồng hành cùng trẻ trên hành trình phát triển kỹ năng, tự tin hòa nhập và vươn xa mỗi ngày.</p>
      <div className="heroButtons"><Button asChild size="lg" className="h-12 px-6 font-bold"><a href="#programs">Khám phá chương trình</a></Button><a className="playLink" href="#community">Xem một ngày tại {siteConfig.shortName}</a></div>
      <div className="trustRow"><span><Mark name="check"/>Kế hoạch giáo dục cá nhân</span><span><Mark name="check"/>Can thiệp 1–1</span><span><Mark name="check"/>Phối hợp cùng phụ huynh</span></div>
    </div>
    <div className="heroArt" aria-label={`Giáo viên đồng hành cùng trẻ tại Trung tâm ${siteConfig.shortName}`}>
      <div className="sunDoodle"><Mark name="sparkle"/></div><div className="shape arch"/><div className="shape dotGrid"/><div className="photoFrame"><div className="portrait"><span className="hair"/><span className="face">˘‿˘</span><span className="shirt"/><span className="paper"><Mark name="heart"/></span></div></div>
      <div className="quoteCard"><span className="quoteMark">“</span><p>Mỗi {keep("tiến bộ")} của trẻ, dù {keep("nhỏ bé")}, đều là một niềm vui đáng {keep("trân trọng.")}</p><strong>— {keep(`Trung tâm ${siteConfig.shortName}`)}</strong></div>
    </div>
  </section>

  <section className="statement" id="approach"><p className="eyebrow centered">{keep("Nơi trái tim")} chạm đến {keep("trái tim")}</p><h2>{keep("Kiên nhẫn.")} {keep("Yêu thương.")} {keep("Thấu hiểu")} {keep("từng em.")}</h2><p>{siteConfig.shortName} xây dựng môi trường an toàn, gần gũi, nơi mỗi trẻ được quan sát, đánh giá và hỗ trợ theo khả năng riêng. Giáo viên luôn ghi nhận từng bước tiến và trao đổi chặt chẽ cùng gia đình.</p></section>

  <section className="programs" id="programs">{programs.map((program,index)=><article className={`programCard card${index+1}`} key={program.title}><div className="programIcon"><Mark name={program.icon}/></div><span className="cardNumber">0{index+1}</span><h3>{program.title}</h3><p>{program.text}</p></article>)}</section>

  <section className="community" id="community"><div><p className="eyebrow">Một ngày học tập tại {keep(siteConfig.shortName)}</p><h2>Học qua chơi, {keep("tiến bộ")} qua từng {keep("hoạt động.")}</h2><p>Trẻ được đón tiếp vui vẻ, khởi động bằng âm nhạc và vận động, tham gia hoạt động nhóm, học cá nhân 1–1, rèn kỹ năng tự phục vụ và vui chơi theo sở thích. Cuối ngày, giáo viên ghi nhận tiến bộ và trao đổi trực tiếp với phụ huynh.</p></div><div className="momentCard"><div className="momentIllustration"><span><Mark name="sun"/></span><b>Mỗi {keep("tiến bộ")} là một {keep("niềm vui.")}</b></div></div></section>

  <section className="visit" id="visit"><div><p className="eyebrow">{keep("Đồng hành")} cùng trẻ {keep("mỗi ngày")}</p><h2>Cùng con {keep("xây dựng")} {keep("hành trình")} {keep("phát triển")} {keep("phù hợp.")}</h2><p>Gặp gỡ giáo viên, tìm hiểu hoạt động và chia sẻ những điều gia đình đang quan tâm về trẻ.</p></div><Button asChild size="lg" className="h-12 min-w-44 bg-white px-6 font-bold text-primary hover:bg-[#efbd55] hover:text-primary"><a href="#programs">Xem chương trình</a></Button></section>
  <footer><BrandLogo tone="light" size="sm"/><p>Kiên nhẫn – Yêu thương – Thấu hiểu.</p><span>© 2026 {siteConfig.name}</span></footer>
</main>;

export default Home;
