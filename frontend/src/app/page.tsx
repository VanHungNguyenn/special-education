import Link from "next/link";
import { siteConfig } from "@/config/site";

const programs = [
  { icon: "community", title: "Hoạt động nhóm", text: "Chơi – học có chủ đích, rèn kỹ năng chờ đợi, luân phiên, chia sẻ, giao tiếp và tương tác xã hội." },
  { icon: "spark", title: "Học cá nhân 1–1", text: "Đánh giá khả năng của từng trẻ và xây dựng kế hoạch phù hợp về giao tiếp, nhận thức, vận động và tự lập." },
  { icon: "heart", title: "Vận động & tự phục vụ", text: "Kết hợp vận động thô, vận động tinh, ăn uống, vệ sinh và nghỉ ngơi để trẻ phát triển toàn diện mỗi ngày." },
];

const Mark = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    spark: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/></>,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
    community: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.4"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M15 15c3.4-.6 5.5 1.1 6 4"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>, check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
};

const Home = () => <main>
  <header className="siteHeader">
    <Link className="brand" href="/"><span className="brandMark">{siteConfig.initial}</span><span>{siteConfig.shortName}<span className="brandSub">Giáo dục trẻ đặc biệt</span></span></Link>
    <nav aria-label="Điều hướng chính"><a href="#approach">Về {siteConfig.shortName}</a><a href="#programs">Chương trình</a><a href="#community">Một ngày tại trung tâm</a></nav>
    <div className="headerActions"><Link className="textLink" href="/login">Đăng nhập</Link><a className="button small" href="#visit">Tìm hiểu trung tâm</a></div>
  </header>

  <section className="hero">
    <div className="heroCopy">
      <div className="eyebrow"><span/>{siteConfig.name}</div>
      <h1>Mỗi trẻ là một<br/><em>cá thể đặc biệt.</em></h1>
      <p>Với sự kiên nhẫn, yêu thương và thấu hiểu, {siteConfig.shortName} đồng hành cùng trẻ trên hành trình phát triển kỹ năng, tự tin hòa nhập và vươn xa mỗi ngày.</p>
      <div className="heroButtons"><a className="button" href="#programs">Khám phá chương trình <Mark name="arrow"/></a><a className="playLink" href="#community"><span className="play">▶</span>Một ngày tại {siteConfig.shortName}</a></div>
      <div className="trustRow"><span><Mark name="check"/>Kế hoạch giáo dục cá nhân</span><span><Mark name="check"/>Can thiệp 1–1</span><span><Mark name="check"/>Phối hợp cùng phụ huynh</span></div>
    </div>
    <div className="heroArt" aria-label={`Giáo viên đồng hành cùng trẻ tại Trung tâm ${siteConfig.shortName}`}>
      <div className="sunDoodle">✦</div><div className="shape arch"/><div className="shape dotGrid"/><div className="photoFrame"><div className="portrait"><span className="hair"/><span className="face">˘‿˘</span><span className="shirt"/><span className="paper">♥</span></div></div>
      <div className="quoteCard"><span className="quoteMark">“</span><p>Mỗi tiến bộ của trẻ, dù nhỏ bé, đều là một niềm vui đáng trân trọng.</p><strong>— Trung tâm {siteConfig.shortName}</strong></div>
    </div>
  </section>

  <section className="statement" id="approach"><p className="eyebrow centered">Nơi trái tim chạm đến trái tim</p><h2>Kiên nhẫn. Yêu thương.<br/>Thấu hiểu từng em.</h2><p>{siteConfig.shortName} xây dựng môi trường an toàn, gần gũi, nơi mỗi trẻ được quan sát, đánh giá và hỗ trợ theo khả năng riêng. Giáo viên luôn ghi nhận từng bước tiến và trao đổi chặt chẽ cùng gia đình.</p></section>

  <section className="programs" id="programs">{programs.map((program,index)=><article className={`programCard card${index+1}`} key={program.title}><div className="programIcon"><Mark name={program.icon}/></div><span className="cardNumber">0{index+1}</span><h3>{program.title}</h3><p>{program.text}</p><a href="#community">Xem lịch hoạt động <Mark name="arrow"/></a></article>)}</section>

  <section className="community" id="community"><div><p className="eyebrow">Một ngày học tập tại {siteConfig.shortName}</p><h2>Học qua chơi, tiến bộ qua từng hoạt động.</h2><p>Trẻ được đón tiếp vui vẻ, khởi động bằng âm nhạc và vận động, tham gia hoạt động nhóm, học cá nhân 1–1, rèn kỹ năng tự phục vụ và vui chơi theo sở thích. Cuối ngày, giáo viên ghi nhận tiến bộ và trao đổi trực tiếp với phụ huynh.</p><div className="impact"><div><strong>8:30</strong><span>hoạt động nhóm</span></div><div><strong>10:30</strong><span>học cá nhân 1–1</span></div><div><strong>15:00</strong><span>trao đổi phụ huynh</span></div></div></div><div className="momentCard"><div className="momentIllustration"><span>☀</span><b>Mỗi tiến bộ<br/>là một<br/>niềm vui.</b></div></div></section>

  <section className="visit" id="visit"><div><p className="eyebrow">Đồng hành cùng trẻ mỗi ngày</p><h2>Cùng con xây dựng hành trình phát triển phù hợp.</h2><p>Gặp gỡ giáo viên, tìm hiểu hoạt động và chia sẻ những điều gia đình đang quan tâm về trẻ.</p></div><a className="button light" href="#programs">Xem chương trình <Mark name="arrow"/></a></section>
  <footer><Link className="brand inverse" href="/"><span className="brandMark">{siteConfig.initial}</span><span>{siteConfig.shortName}<span className="brandSub">Giáo dục trẻ đặc biệt</span></span></Link><p>Kiên nhẫn – Yêu thương – Thấu hiểu.</p><span>© 2026 {siteConfig.name}</span></footer>
</main>;

export default Home;
