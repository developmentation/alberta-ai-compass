import React, { useState } from 'react';
import { Card } from './ui/card';
import { AIMentorChat } from './AIMentorChat';
import { UniversalContentOpener } from './UniversalContentOpener';

interface AIMentorProps {
  onLoginClick: () => void;
}

export function AIMentor({ onLoginClick }: AIMentorProps) {
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContentOpen = (content: any) => {
    console.log('🎯 AIMentor: Opening content:', content);
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Main Chat Interface */}
        <Card className="h-[600px]">
          <AIMentorChat onContentOpen={handleContentOpen} />
        </Card>

      </div>

      {/* Universal Content Modal */}
      <UniversalContentOpener
        isOpen={isModalOpen}
        onClose={handleModalClose}
        content={selectedContent}
      />
    </>
  );
}