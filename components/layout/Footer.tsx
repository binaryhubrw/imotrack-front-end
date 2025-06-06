import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faChevronRight,
  faEnvelope,
  faLinkSlash,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function Footer() {
  return (
    <div>
      <footer className="bg-[#0872b3] text-white mt-0 pt-8">
        <div className="max-w-6xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-2">Imotrak</h4>
            <p>Binary Hub</p>
            <div className="flex gap-4 mt-4">
              <a href="#">
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="text-2xl hover:text-[#0872b3]"
                />
              </a>
              <a href="#">
                <FontAwesomeIcon
                  icon={faTwitter}
                  className="text-2xl hover:text-[#0872b3]"
                />
              </a>
              <a href="#">
                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="text-2xl hover:text-[#0872b3]"
                />
              </a>
              <a href="#">
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="text-2xl hover:text-[#0872b3]"
                />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Contact
            </h4>
            <p className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} /> Email: info@ur.ac.rw
            </p>
            <p className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} /> Phone: +250 788 123 456
            </p>
            <p className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkedAlt} /> Address: Binary Hub,
              Kigali
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLinkSlash} /> Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="flex items-center gap-2 hover:text-[#ccd3d6ec] jump-on-hover"
                >
                  <FontAwesomeIcon icon={faChevronRight} /> Home
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="flex items-center gap-2 hover:text-[#ccd3d6ec] jump-on-hover"
                >
                  <FontAwesomeIcon icon={faChevronRight} /> Features
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  className="flex items-center gap-2 hover:text-[#ccd3d6ec] jump-on-hover"
                >
                  <FontAwesomeIcon icon={faChevronRight} /> Benefits
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="flex items-center gap-2 hover:text-[#ccd3d6ec] jump-on-hover"
                >
                  <FontAwesomeIcon icon={faChevronRight} /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className=" text-white text-center py-4">
          <p>&copy; 2025 Binary Hub - Imotrak. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
