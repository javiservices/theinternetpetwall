import React from "react";
import { Camera, PenLine, Award, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="how-section">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 48px" }}>
          <div className="section-tag">
            <Sparkles size={14} />
            <span>{t("how_tag")}</span>
          </div>
          <h2 className="section-title">{t("how_title")}</h2>
          <p className="section-description">{t("how_desc")}</p>
        </div>

        {/* 3 Step Process Grid */}
        <div className="how-steps-grid">
          <div className="how-step-card">
            <div className="how-step-icon" style={{ background: "#FEF3C7", color: "#D97706" }}>
              <Camera size={26} />
            </div>
            <h3 className="how-step-title">{t("step1_title")}</h3>
            <p className="how-step-desc">{t("step1_desc")}</p>
          </div>

          <div className="how-step-card">
            <div className="how-step-icon" style={{ background: "#DBEAFE", color: "#2563EB" }}>
              <PenLine size={26} />
            </div>
            <h3 className="how-step-title">{t("step2_title")}</h3>
            <p className="how-step-desc">{t("step2_desc")}</p>
          </div>

          <div className="how-step-card">
            <div className="how-step-icon" style={{ background: "#D1FAE5", color: "#059669" }}>
              <Award size={26} />
            </div>
            <h3 className="how-step-title">{t("step3_title")}</h3>
            <p className="how-step-desc">{t("step3_desc")}</p>
          </div>
        </div>

        {/* Mission & Cause Banner */}
        <div className="how-cause-banner">
          <div className="how-cause-icon">
            <HeartHandshake size={32} color="#E11D48" />
          </div>
          <div>
            <h3 className="how-cause-title">{t("cause_title")}</h3>
            <p className="how-cause-desc">{t("cause_desc")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
