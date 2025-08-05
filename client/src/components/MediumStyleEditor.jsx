import React, { useState, useRef, useEffect, useCallback } from 'react';
import useFileUpload from '../hooks/useFileUpload';
import { toast } from 'react-toastify';

import { 
  Button, 
  Card, 
  CardBody, 
  Typography, 
  Tabs, 
  TabsHeader, 
  TabsBody, 
  Tab, 
  TabPanel,
  Badge,
  IconButton,
  Tooltip
} from "@material-tailwind/react";
import { 
  EyeIcon, 
  PencilIcon, 
  PhotoIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";


function MediumStyleEditor({ content, setContent, placeholder = "Hikayenizi anlatın...", title, setTitle }) {
  const [editorInstance, setEditorInstance] = useState(null);
  const [activeTab, setActiveTab] = useState("write");
  const [isDragging, setIsDragging] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const { uploadSingle } = useFileUpload();
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);

  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (content || title) {
      setAutoSaveStatus("saving");
      // Save to localStorage
      try {
        const draftData = {
          title: title || '',
          content: content || '',
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('blogDraft', JSON.stringify(draftData));
        
        setTimeout(() => {
          setAutoSaveStatus("saved");
          setLastSaved(new Date());
        }, 1000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus("error");
      }
    }
  }, [content, title]);

  // Load draft on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('blogDraft');
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        if (setTitle && draftData.title && !title) {
          setTitle(draftData.title);
        }
        if (draftData.content && !content) {
          setContent(draftData.content);
        }
        setLastSaved(new Date(draftData.timestamp));
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(autoSave, 2000);
    return () => clearTimeout(timer);
  }, [content, title, autoSave]);

  // Calculate writing statistics
  useEffect(() => {
    if (content) {
      const text = content.replace(/<[^>]*>/g, '');
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
      setReadingTime(Math.ceil(words.length / 200)); // 200 words per minute
    } else {
      setWordCount(0);
      setCharCount(0);
      setReadingTime(0);
    }
  }, [content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            autoSave();
            toast.success('Taslak kaydedildi!');
            break;
          case 'p':
            e.preventDefault();
            setActiveTab(activeTab === 'write' ? 'preview' : 'write');
            break;
          case 'f':
            e.preventDefault();
            setIsFullscreen(!isFullscreen);
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(!showShortcuts);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isFullscreen, showShortcuts, autoSave]);


  const handleImageUpload = async (file) => {
    try {
      const uploadedFile = await uploadSingle(file, '/upload/single');
      if (uploadedFile) {
        const imageMarkdown = `\n![${file.name}](${uploadedFile.url})\n`;
        const textarea = editorRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const newContent = content.substring(0, cursorPos) + imageMarkdown + content.substring(cursorPos);
          setContent(newContent);
          setAutoSaveStatus("saving");
          
          // Focus and set cursor position after image
          setTimeout(() => {
            textarea.focus();
            const newCursorPos = cursorPos + imageMarkdown.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        }
        toast.success('Resim başarıyla yüklendi');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Resim yüklenemedi');
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleImageUpload(imageFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('blogDraft');
    toast.success('Taslak temizlendi');
  };

  const insertText = (before, after) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    setAutoSaveStatus("saving");
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderPreview = () => {
    const processMarkdown = (text) => {
      if (!text) return '<p class="text-gray-500 italic">İçerik henüz yazılmadı...</p>';
      
      const processedText = text
        // Images (must be before links)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
        // Headers
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-6">$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>')
        // Lists
        .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
        .replace(/(<li.*<\/li>)/s, '<ul class="list-disc my-4">$1</ul>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">$1</blockquote>')
        // Line breaks
        .replace(/\n\n/gim, '</p><p class="mb-4">')
        .replace(/\n/gim, '<br>');
      
      // Wrap in paragraph if not already wrapped
      const processed = processedText.trim();
      if (processed && !processed.startsWith('<')) {
        return `<p class="mb-4">${processed}</p>`;
      }
      return processed;
    };

    return (
      <div className={`prose prose-lg max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
        {title && (
          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight dark:text-white">
            {title}
          </h1>
        )}
        <div 
          className="medium-preview-content"
          dangerouslySetInnerHTML={{ 
            __html: processMarkdown(content)
          }}
        />
      </div>
    );
  };

  const formatLastSaved = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "şimdi";
    if (minutes < 60) return `${minutes} dakika önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const containerClasses = `medium-style-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''} ${isDarkMode ? 'dark' : ''}`;

  return (
    <div className={containerClasses} ref={editorContainerRef}>
      {/* Enhanced Status Bar */}
      <div className={`flex items-center justify-between mb-6 p-4 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{wordCount} kelime</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{readingTime} dk okuma</span>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="small" className="text-gray-600 dark:text-gray-300">
              {charCount} karakter
            </Typography>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Tooltip content="Tam ekran (Ctrl+F)">
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-gray-600 dark:text-gray-300"
              >
                {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip content="Koyu mod">
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="text-gray-600 dark:text-gray-300"
              >
                {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </IconButton>
            </Tooltip>
            
            <Tooltip content="Klavye kısayolları (Ctrl+/)">
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-gray-600 dark:text-gray-300"
              >
                <QuestionMarkCircleIcon className="w-4 h-4" />
              </IconButton>
            </Tooltip>
          </div>

          {/* Auto-save Status */}
          <div className="flex items-center gap-2">
            {autoSaveStatus === "saving" ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Kaydediliyor...</span>
              </>
            ) : autoSaveStatus === "error" ? (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400">Kayıt hatası</span>
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Son kayıt: {formatLastSaved(lastSaved)}
                </span>
              </>
            )}
          </div>

          <Button
            size="sm"
            variant="outlined"
            onClick={clearDraft}
            className="text-gray-600 dark:text-gray-300"
          >
            Taslağı Temizle
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardBody>
              <Typography variant="h6" className="mb-4">Klavye Kısayolları</Typography>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Kaydet</span>
                  <Badge variant="ghost">Ctrl+S</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Önizleme</span>
                  <Badge variant="ghost">Ctrl+P</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tam ekran</span>
                  <Badge variant="ghost">Ctrl+F</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Bu menü</span>
                  <Badge variant="ghost">Ctrl+/</Badge>
                </div>
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => setShowShortcuts(false)}
              >
                Kapat
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Editor Tabs */}
      <Card className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardBody className="p-0">
          <Tabs value={activeTab} className="w-full">
            <TabsHeader className={`p-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <Tab 
                key="write" 
                value="write" 
                onClick={() => setActiveTab("write")}
                className="flex items-center gap-2 data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
                Yaz
              </Tab>
              <Tab 
                key="preview" 
                value="preview"
                onClick={() => setActiveTab("preview")}
                className="flex items-center gap-2 data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-600"
              >
                <EyeIcon className="w-4 h-4" />
                Önizle
              </Tab>
            </TabsHeader>
            
            <TabsBody>
              <TabPanel key="write" value="write" className="p-0">
                <div className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                  {/* Enhanced Title Input */}
                  {setTitle && (
                    <div className="mb-8">
                      <input
                        ref={titleRef}
                        type="text"
                        placeholder="Başlık yazın..."
                        value={title || ""}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full text-4xl font-bold placeholder-gray-400 border-none outline-none bg-transparent resize-none leading-tight transition-colors ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                        style={{ fontFamily: 'Georgia, serif' }}
                      />
                      <div className={`w-full h-px mt-6 transition-colors ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                      {title && (
                        <div className="mt-2 text-sm text-gray-500">
                          Başlık: {title.length} karakter
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 mb-6">
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <PhotoIcon className="w-4 h-4" />
                      Resim Ekle
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => setFocusMode(!focusMode)}
                      className={focusMode ? 'bg-blue-50 text-blue-600' : ''}
                    >
                      {focusMode ? 'Odak Modunu Kapat' : 'Odak Modu'}
                    </Button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* CKEditor with Error Handling */}
                  <div 
                    className={`prose max-w-none transition-all duration-300 ${
                      isDragging ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    } ${focusMode ? 'opacity-100' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <div className="rich-text-editor">
                      <div className="toolbar mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => insertText('**', '**')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            <strong>B</strong>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('*', '*')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            <em>I</em>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('[', '](url)')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            Link
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('\n# ', '')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            H1
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('\n## ', '')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('\n- ', '')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            List
                          </button>
                          <button
                            type="button"
                            onClick={() => insertText('\n> ', '')}
                            className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border rounded hover:bg-gray-100 dark:hover:bg-gray-500"
                          >
                            Quote
                          </button>
                        </div>
                      </div>
                      
                      <textarea
                        ref={editorRef}
                        value={content || ""}
                        onChange={(e) => {
                          setContent(e.target.value);
                          setAutoSaveStatus("saving");
                        }}
                        placeholder={placeholder}
                        className={`w-full resize-none border border-gray-200 dark:border-gray-600 rounded-lg outline-none transition-colors focus:border-blue-500 dark:focus:border-blue-400 ${
                          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                        }`}
                        style={{
                          minHeight: isFullscreen ? '70vh' : '500px',
                          fontSize: '18px',
                          lineHeight: '1.7',
                          fontFamily: 'Georgia, serif',
                          padding: '20px'
                        }}
                      />
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Markdown formatını destekler: **kalın**, *italic*, [link](url), # başlık
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Drag and Drop Zone */}
                  {isDragging && (
                    <div className="fixed inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center z-40">
                      <div className={`p-8 rounded-lg shadow-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <PhotoIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <Typography variant="h6" className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Resmi buraya bırakın
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-300">
                          PNG, JPG, GIF formatları desteklenir (Max 10MB)
                        </Typography>
                      </div>
                    </div>
                  )}
                </div>
              </TabPanel>
              
              <TabPanel key="preview" value="preview" className={`p-6 ${isDarkMode ? 'bg-gray-800' : ''}`}>
                <div style={{ fontFamily: 'Georgia, serif' }} className={isDarkMode ? 'text-white' : ''}>
                  {renderPreview()}
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

      {/* Writing Tips */}
      <Card className={`border-blue-200 ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50'}`}>
        <CardBody>
          <Typography variant="h6" className={`mb-3 ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
            💡 Yazma İpuçları
          </Typography>
          <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
            <li>• Dikkat çekici bir başlık ile başlayın</li>
            <li>• Resimlerinizi sürükle-bırak ile kolayca ekleyin</li>
            <li>• Önizleme sekmesini kullanarak yazınızın nasıl görüneceğini kontrol edin</li>
            <li>• Ctrl+S ile manuel kayıt yapabilir, Ctrl+P ile önizlemeye geçebilirsiniz</li>
            <li>• Odak modu ile daha az dikkat dağıtıcı bir yazma deneyimi yaşayın</li>
          </ul>
        </CardBody>
      </Card>

      {/* Enhanced Custom CSS */}
      <style>{`
        .medium-style-editor.dark {
          color-scheme: dark;
        }
        
        .medium-style-editor .ck-editor__editable {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          transition: all 0.3s ease;
        }
        
        .medium-style-editor.dark .ck-editor__editable {
          background: #374151 !important;
          color: #f9fafb !important;
        }
        
        .medium-style-editor .ck-editor__main {
          background: transparent;
        }
        
        .medium-style-editor .ck-toolbar {
          border: none !important;
          background: #f8f9fa !important;
          border-radius: 8px !important;
          padding: 12px !important;
          margin-bottom: 20px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          transition: all 0.3s ease;
        }
        
        .medium-style-editor.dark .ck-toolbar {
          background: #4b5563 !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
        }
        
        .medium-style-editor .ck-toolbar__separator {
          background: #e5e7eb !important;
        }
        
        .medium-style-editor.dark .ck-toolbar__separator {
          background: #6b7280 !important;
        }
        
        .medium-style-editor .ck-button {
          border-radius: 6px !important;
          transition: all 0.2s ease;
        }
        
        .medium-style-editor .ck-button:hover {
          background: #e5e7eb !important;
          transform: translateY(-1px);
        }
        
        .medium-style-editor.dark .ck-button:hover {
          background: #6b7280 !important;
        }
        
        .medium-style-editor .ck-button.ck-on {
          background: #3b82f6 !important;
          color: white !important;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
        }
        
        .medium-style-editor .ck-content h1 {
          font-size: 2.5em !important;
          line-height: 1.2 !important;
          margin: 1em 0 0.5em 0 !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
        }
        
        .medium-style-editor.dark .ck-content h1 {
          color: #f9fafb !important;
        }
        
        .medium-style-editor .ck-content h2 {
          font-size: 2em !important;
          line-height: 1.3 !important;
          margin: 1em 0 0.5em 0 !important;
          font-weight: 600 !important;
          color: #374151 !important;
        }
        
        .medium-style-editor.dark .ck-content h2 {
          color: #e5e7eb !important;
        }
        
        .medium-style-editor .ck-content h3 {
          font-size: 1.5em !important;
          line-height: 1.4 !important;
          margin: 1em 0 0.5em 0 !important;
          font-weight: 600 !important;
          color: #4b5563 !important;
        }
        
        .medium-style-editor.dark .ck-content h3 {
          color: #d1d5db !important;
        }
        
        .medium-style-editor .ck-content p {
          margin: 1.5em 0 !important;
          line-height: 1.7 !important;
          color: #374151 !important;
          font-size: 20px !important;
        }
        
        .medium-style-editor.dark .ck-content p {
          color: #f3f4f6 !important;
        }
        
        .medium-style-editor .ck-content blockquote {
          font-style: italic !important;
          border-left: 4px solid #3b82f6 !important;
          margin: 2em 0 !important;
          padding: 1.5em 2em !important;
          color: #6b7280 !important;
          background: #f8fafc !important;
          border-radius: 0 8px 8px 0 !important;
          position: relative !important;
        }
        
        .medium-style-editor.dark .ck-content blockquote {
          background: #374151 !important;
          color: #d1d5db !important;
          border-left-color: #60a5fa !important;
        }
        
        .medium-style-editor .ck-content blockquote::before {
          content: '"' !important;
          font-size: 4em !important;
          color: #3b82f6 !important;
          position: absolute !important;
          left: 10px !important;
          top: -10px !important;
          opacity: 0.3 !important;
        }
        
        .medium-style-editor .ck-content img {
          max-width: 100% !important;
          height: auto !important;
          margin: 2em auto !important;
          display: block !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }
        
        .medium-style-editor .ck-content img:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15) !important;
        }
        
        .medium-style-editor .ck-content pre {
          background: #1f2937 !important;
          color: #f9fafb !important;
          padding: 1.5em !important;
          border-radius: 8px !important;
          overflow-x: auto !important;
          margin: 2em 0 !important;
          position: relative !important;
        }
        
        .medium-style-editor .ck-content pre::before {
          content: 'Code' !important;
          position: absolute !important;
          top: 8px !important;
          right: 12px !important;
          font-size: 12px !important;
          color: #9ca3af !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        
        .medium-style-editor .ck-content code {
          background: #f3f4f6 !important;
          color: #dc2626 !important;
          padding: 0.2em 0.4em !important;
          border-radius: 4px !important;
          font-size: 0.9em !important;
          font-weight: 500 !important;
        }
        
        .medium-style-editor.dark .ck-content code {
          background: #4b5563 !important;
          color: #fca5a5 !important;
        }
        
        .medium-style-editor .ck-content ul,
        .medium-style-editor .ck-content ol {
          margin: 1.5em 0 !important;
          padding-left: 2em !important;
        }
        
        .medium-style-editor .ck-content li {
          margin: 0.5em 0 !important;
          line-height: 1.7 !important;
        }
        
        .medium-style-editor .ck-content table {
          border-collapse: collapse !important;
          margin: 2em auto !important;
          width: 100% !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
        }
        
        .medium-style-editor .ck-content table th,
        .medium-style-editor .ck-content table td {
          border: 1px solid #e5e7eb !important;
          padding: 12px !important;
          text-align: left !important;
        }
        
        .medium-style-editor.dark .ck-content table th,
        .medium-style-editor.dark .ck-content table td {
          border-color: #4b5563 !important;
        }
        
        .medium-style-editor .ck-content table th {
          background: #f9fafb !important;
          font-weight: 600 !important;
        }
        
        .medium-style-editor.dark .ck-content table th {
          background: #374151 !important;
          color: #f9fafb !important;
        }
        
        /* Preview styles */
        .medium-preview-content h1 {
          font-size: 2.5em;
          line-height: 1.2;
          margin: 1em 0 0.5em 0;
          font-weight: 700;
          color: #1f2937;
        }
        
        .dark .medium-preview-content h1 {
          color: #f9fafb;
        }
        
        .medium-preview-content h2 {
          font-size: 2em;
          line-height: 1.3;
          margin: 1em 0 0.5em 0;
          font-weight: 600;
          color: #374151;
        }
        
        .dark .medium-preview-content h2 {
          color: #e5e7eb;
        }
        
        .medium-preview-content h3 {
          font-size: 1.5em;
          line-height: 1.4;
          margin: 1em 0 0.5em 0;
          font-weight: 600;
          color: #4b5563;
        }
        
        .dark .medium-preview-content h3 {
          color: #d1d5db;
        }
        
        .medium-preview-content p {
          margin: 1.5em 0;
          line-height: 1.7;
          color: #374151;
          font-size: 20px;
        }
        
        .dark .medium-preview-content p {
          color: #f3f4f6;
        }
        
        .medium-preview-content blockquote {
          font-style: italic;
          border-left: 4px solid #3b82f6;
          margin: 2em 0;
          padding: 1.5em 2em;
          color: #6b7280;
          background: #f8fafc;
          border-radius: 0 8px 8px 0;
          position: relative;
        }
        
        .dark .medium-preview-content blockquote {
          background: #374151;
          color: #d1d5db;
        }
        
        .medium-preview-content blockquote::before {
          content: '"';
          font-size: 4em;
          color: #3b82f6;
          position: absolute;
          left: 10px;
          top: -10px;
          opacity: 0.3;
        }
        
        .medium-preview-content img {
          max-width: 100%;
          height: auto;
          margin: 2em auto;
          display: block;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .medium-preview-content pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1.5em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 2em 0;
        }
        
        .medium-preview-content code {
          background: #f3f4f6;
          color: #dc2626;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .dark .medium-preview-content code {
          background: #4b5563;
          color: #fca5a5;
        }
        
        .medium-preview-content ul,
        .medium-preview-content ol {
          margin: 1.5em 0;
          padding-left: 2em;
        }
        
        .medium-preview-content li {
          margin: 0.5em 0;
          line-height: 1.7;
        }
        
        .medium-preview-content table {
          border-collapse: collapse;
          margin: 2em auto;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .medium-preview-content table th,
        .medium-preview-content table td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        
        .dark .medium-preview-content table th,
        .dark .medium-preview-content table td {
          border-color: #4b5563;
        }
        
        .medium-preview-content table th {
          background: #f9fafb;
          font-weight: 600;
        }
        
        .dark .medium-preview-content table th {
          background: #374151;
        }
      `}</style>
    </div>
  );
}

export default MediumStyleEditor;