// PotentialBillsSection.js

import React from 'react';
import { Mail, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getEmails } from '@/api';
import { useState, useEffect } from 'react';
import { deleteEmail } from '@/api';

export default function PotentialBillsSection() {

  const [emails, setEmails] = useState<any[]>([]);

  useEffect(() => {
    getEmails()
      .then((data) => {
        setEmails(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleDeleteEmail = (id: number) => {
    deleteEmail(id)
      .then(() => {
        setEmails((prevEmails) => prevEmails.filter((email) => email.id !== id));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potential Bills from Emails</CardTitle>
        <CardDescription>Emails that might require payment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emails.map((email) => (
            <div key={email.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">{email.subject}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Button onClick={() => handleDeleteEmail(email.id)} size="sm">
                  <X />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}