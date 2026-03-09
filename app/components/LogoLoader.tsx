import Image from 'next/image';
import Logo from '../../public/church-bg.png';

type LogoLoaderProps = {
  label?: string;
  containerClassName?: string;
  size?: number;
};

export default function LogoLoader({
  label = 'Loading',
  containerClassName = 'min-h-[220px]',
  size = 112,
}: LogoLoaderProps) {
  return (
    <div className={`flex items-center justify-center px-6 ${containerClassName}`}>
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src={Logo}
          width={size}
          height={size}
          alt="Church Logo"
          priority
          className="logo-loader rounded-full"
        />
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-red-700/80">
          {label}
        </p>
      </div>
    </div>
  );
}
