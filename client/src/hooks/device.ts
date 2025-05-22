import { useEffect, useState } from "react";

enum DeviceType {
  MOBILE,
  DESKTOP,
}

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>(DeviceType.DESKTOP);

  useEffect(() => {
    const handleResize = () => {
      setDevice(
        window.innerWidth <= 1024 ? DeviceType.MOBILE : DeviceType.DESKTOP,
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    isMobile: device === DeviceType.MOBILE,
    isDesktop: device === DeviceType.DESKTOP,
  };
}
