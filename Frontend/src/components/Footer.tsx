import { Shield, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">GrievanceAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered grievance redressal platform for efficient citizen services and transparent governance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/submit" className="hover:text-foreground transition-colors">Submit Grievance</a></li>
              <li><a href="/track" className="hover:text-foreground transition-colors">Track Status</a></li>
              <li><a href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Departments */}
          <div className="space-y-4">
            <h4 className="font-semibold">Departments</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Municipal Corporation</li>
              <li>Water Supply Board</li>
              <li>Electricity Board</li>
              <li>Public Works Dept</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                1800-XXX-XXXX (Toll Free)
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@grievanceai.gov
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Government Complex,<br />New Delhi - 110001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2024 GrievanceAI. A Government of India Initiative. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
