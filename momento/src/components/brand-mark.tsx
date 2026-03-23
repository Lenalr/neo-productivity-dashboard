import Image from "next/image";
import Link from "next/link";

export function BrandMark() {
  return (
    <Link href="/" className="brand-mark" aria-label="Momento home">
      <div className="brand-mark__logo">
        <Image src="/brand/neotechie-logo.png" alt="NeoTechie logo" width={42} height={42} priority />
      </div>
      <div>
        <p className="eyebrow">NeoTechie Internal Suite</p>
        <h1>Momento</h1>
      </div>
    </Link>
  );
}
