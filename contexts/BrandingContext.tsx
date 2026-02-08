import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../services/firebase";

export interface BrandingSettings {
  appearance: {
    platformName: string;
    institutionName: string;
    applicationName: string;
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    logoUrl: string;
  };
  system: {
    maintenanceMode: boolean;
    publicSignups: boolean;
    dynamicCache: boolean;
  };
  security: {
    require2FA: boolean;
    auditLogs: boolean;
    limitedSessions: boolean;
  };
}

const defaultBranding: BrandingSettings = {
  appearance: {
    platformName: "EduPrime",
    institutionName: "EduPrime Academy Group",
    applicationName: "EduPrime LMS Portal",
    primaryColor: "#0e7038",
    accentColor: "#eab308",
    fontFamily: "Inter",
    logoUrl: "",
  },
  system: {
    maintenanceMode: false,
    publicSignups: true,
    dynamicCache: true,
  },
  security: {
    require2FA: true,
    auditLogs: true,
    limitedSessions: false,
  },
};

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(
  undefined,
);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);

  // Injetar CSS IMEDIATAMENTE com cores padrão
  useEffect(() => {
    const styleId = "dynamic-branding-styles";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Injetar com cores padrão AGORA
    injectBrandingStyles(defaultBranding, styleElement);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "system"),
      (snapshot) => {
        const styleElement = document.getElementById(
          "dynamic-branding-styles",
        ) as HTMLStyleElement;

        if (snapshot.exists()) {
          const data = snapshot.data() as any;
          const newBranding = {
            appearance: { ...defaultBranding.appearance, ...data.appearance },
            system: { ...defaultBranding.system, ...data.system },
            security: { ...defaultBranding.security, ...data.security },
          };
          setBranding(newBranding);
          if (styleElement) injectBrandingStyles(newBranding, styleElement);
        } else {
          setBranding(defaultBranding);
          if (styleElement) injectBrandingStyles(defaultBranding, styleElement);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar configurações de branding:", error);
        setBranding(defaultBranding);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // Atualizar título da página e favicon
  useEffect(() => {
    document.title = branding.appearance.applicationName;

    // Atualizar favicon
    const faviconLink = document.getElementById(
      "dynamic-favicon",
    ) as HTMLLinkElement;
    if (faviconLink) {
      if (branding.appearance.logoUrl) {
        faviconLink.href = branding.appearance.logoUrl;
      } else {
        const svgFavicon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23${branding.appearance.primaryColor.replace("#", "")}' width='100' height='100'/><text x='50' y='60' font-size='60' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'>E</text></svg>`;
        faviconLink.href = svgFavicon;
      }
    }
  }, [
    branding.appearance.applicationName,
    branding.appearance.logoUrl,
    branding.appearance.primaryColor,
  ]);

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  );
};

function injectBrandingStyles(
  branding: BrandingSettings,
  styleElement: HTMLStyleElement,
) {
  const cssVariables = `
    :root {
      --brand-primary: ${branding.appearance.primaryColor};
      --brand-accent: ${branding.appearance.accentColor};
      --brand-font: '${branding.appearance.fontFamily}', sans-serif;
    }
  `;

  const dynamicStyles = `
    body {
      font-family: var(--brand-font);
    }

    .brand-primary {
      color: var(--brand-primary);
    }

    .bg-brand-primary {
      background-color: var(--brand-primary);
    }

    .border-brand-primary {
      border-color: var(--brand-primary);
    }

    .hover\\:bg-brand-primary:hover {
      background-color: var(--brand-primary);
    }

    .hover\\:text-brand-primary:hover {
      color: var(--brand-primary);
    }

    .brand-accent {
      color: var(--brand-accent);
    }

    .bg-brand-accent {
      background-color: var(--brand-accent);
    }

    .text-brand-accent {
      color: var(--brand-accent);
    }

    /* Componentes que usam brand-green */
    .bg-brand-green {
      background-color: var(--brand-primary) !important;
    }

    .hover\\:bg-brand-green:hover {
      background-color: var(--brand-primary) !important;
    }

    .hover\\:bg-brand-dark:hover {
      background-color: #054e25 !important;
    }

    .text-brand-green {
      color: var(--brand-primary) !important;
    }

    .hover\\:text-brand-green:hover {
      color: var(--brand-primary) !important;
    }

    .border-brand-green {
      border-color: var(--brand-primary) !important;
    }

    .focus\\:ring-brand-green\\/20:focus {
      --tw-ring-color: ${branding.appearance.primaryColor}33 !important;
    }

    .focus\\:border-brand-green:focus {
      border-color: var(--brand-primary) !important;
    }

    /* Accent color (yellow/gold) */
    .text-brand-accent {
      color: var(--brand-accent) !important;
    }

    .bg-brand-accent {
      background-color: var(--brand-accent) !important;
    }

    .hover\\:text-brand-accent:hover {
      color: var(--brand-accent) !important;
    }
  `;

  styleElement.innerHTML = cssVariables + dynamicStyles;
}

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
