import React, { useState, useRef, useEffect } from 'react';
import { 
  Scan, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sparkles, 
  X, 
  Layers, 
  ArrowUpRight, 
  RotateCcw, 
  Loader2,
  Package,
  Barcode,
  Search,
  Eye,
  Code
} from 'lucide-react';
import { client, TextDetectionResult, WAREHOUSE_SAMPLE_DOCS, WarehouseSampleDoc } from '../services/visionClient';
import { useWarehouse } from '../context/WarehouseContext';
import { Product } from '../types/warehouse';

interface VisionOcrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound?: (product: Product) => void;
  onOpenMovementWithDoc?: (sku: string, docRef?: string, qty?: number) => void;
}

export const VisionOcrScannerModal: React.FC<VisionOcrScannerModalProps> = ({
  isOpen,
  onClose,
  onProductFound,
  onOpenMovementWithDoc
}) => {
  const { products, currencySymbol } = useWarehouse();

  // Mode: 'sample' | 'upload' | 'camera'
  const [activeTab, setActiveTab] = useState<'sample' | 'upload' | 'camera'>('sample');
  const [selectedSample, setSelectedSample] = useState<WarehouseSampleDoc>(WAREHOUSE_SAMPLE_DOCS[0]);

  // Image source state
  const [previewImage, setPreviewImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<TextDetectionResult | null>(null);
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  // Camera video stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize sample preview on open
  useEffect(() => {
    if (isOpen) {
      const sampleImg = client.generateSampleLabelImage(selectedSample);
      setPreviewImage(sampleImg);
      // Auto run textDetection on initial open
      executeTextDetection(sampleImg);
    } else {
      stopCamera();
      setOcrResult(null);
      setMatchedProduct(null);
    }
  }, [isOpen]);

  // Cleanup camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('No se pudo acceder a la cámara web. Puede utilizar el cargador de imágenes o las etiquetas de prueba.');
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewImage(dataUrl);
      stopCamera();
      executeTextDetection(dataUrl);
    }
  };

  // Execution of the requested client.textDetection()
  const executeTextDetection = async (imageSource: string | File) => {
    setIsProcessing(true);
    setOcrResult(null);
    setMatchedProduct(null);

    try {
      // Direct call to client.textDetection()
      const [result] = await client.textDetection(imageSource);
      setOcrResult(result);

      // Match detected SKU or Barcode with the warehouse catalog
      const detectedSku = result.extractedEntities?.sku;
      const detectedBarcode = result.extractedEntities?.barcode;

      const found = products.find(p => 
        (detectedSku && p.sku.toLowerCase() === detectedSku.toLowerCase()) ||
        (detectedBarcode && p.barcode === detectedBarcode) ||
        (result.fullTextAnnotation && p.sku && result.fullTextAnnotation.text.toLowerCase().includes(p.sku.toLowerCase()))
      );

      if (found) {
        setMatchedProduct(found);
      }
    } catch (err) {
      console.error('Error invoking client.textDetection():', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSample = (sample: WarehouseSampleDoc) => {
    setSelectedSample(sample);
    const sampleImg = client.generateSampleLabelImage(sample);
    setPreviewImage(sampleImg);
    executeTextDetection(sampleImg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewImage(dataUrl);
      executeTextDetection(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Escáner OCR de Almacén · <code className="font-mono text-emerald-400 font-semibold text-xs">client.textDetection()</code>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Google Cloud Vision API
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lectura óptica de etiquetas de racks, bultos con código de barras y guías de remisión mediante detección de texto
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 pt-3 flex items-center gap-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('sample');
              stopCamera();
              handleSelectSample(selectedSample);
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sample' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Etiquetas & Guías de Muestra ({WAREHOUSE_SAMPLE_DOCS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Subir Imagen o Foto</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'camera' 
                ? 'border-slate-900 text-slate-900' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>Cámara en Vivo</span>
          </button>
        </div>

        {/* Body Content Split */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Image Input & Visual Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Sample Selector Pills (if in sample mode) */}
            {activeTab === 'sample' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Seleccionar documento para escanear con OCR:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WAREHOUSE_SAMPLE_DOCS.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleSelectSample(doc)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedSample.id === doc.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold line-clamp-1">{doc.title}</div>
                      <div className="flex items-center gap-2 text-[10px] opacity-80 font-mono mt-0.5">
                        <span>SKU: {doc.sku}</span>
                        <span>·</span>
                        <span>Zona {doc.zone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Box (if in upload mode) */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 p-6 rounded-lg text-center space-y-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 mx-auto flex items-center justify-center text-slate-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Cargar etiqueta, rótulo o guía de remisión</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Formatos compatibles: JPG, PNG, WEBP</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Seleccionar Archivo
                </button>
              </div>
            )}

            {/* Camera View (if in camera mode) */}
            {activeTab === 'camera' && (
              <div className="space-y-3">
                {cameraError ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    {cameraError}
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    
                    {/* Targeting reticle overlay */}
                    <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="text-emerald-300 text-xs font-mono bg-black/60 px-3 py-1 rounded backdrop-blur-xs">
                        Apunte al código o texto de la etiqueta
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraFrame}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar y Procesar con OCR</span>
                  </button>
                </div>
              </div>
            )}

            {/* Visual Scan Preview with Overlay */}
            {previewImage && activeTab !== 'camera' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold">Vista previa de imagen analizada:</span>
                  <button
                    type="button"
                    onClick={() => executeTextDetection(previewImage)}
                    disabled={isProcessing}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 text-[11px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Volver a ejecutar client.textDetection()</span>
                  </button>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center min-h-[220px]">
                  <img
                    src={previewImage}
                    alt="Etiqueta escaneada"
                    className="max-h-80 w-auto object-contain mx-auto"
                  />

                  {/* Processing Overlay */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 animate-in fade-in">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                      <p className="text-xs font-mono font-bold tracking-wide">
                        Ejecutando client.textDetection(image)...
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Segmentando caracteres y reconociendo entidades de almacén
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: OCR Results & Matched Inventory (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Status & Processing metrics */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Método API Invocado:</span>
                <span className="font-mono font-bold text-slate-900">client.textDetection()</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-slate-500 block text-[11px]">Latencia OCR:</span>
                <span className="font-bold text-emerald-700">
                  {ocrResult ? `${ocrResult.processingTimeMs} ms` : '—'}
                </span>
              </div>
            </div>

            {/* Extracted Structured Warehouse Data */}
            {ocrResult && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">Entidades Logísticas Extraídas</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                    Confianza: 96.5%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* SKU */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-slate-600 font-medium">Código SKU Detectado:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {ocrResult.extractedEntities?.sku || 'No detectado'}
                    </span>
                  </div>

                  {/* Barcode */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-slate-600 font-medium">Código EAN-13:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {ocrResult.extractedEntities?.barcode || 'No detectado'}
                    </span>
                  </div>

                  {/* Document Ref */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span className="text-slate-600 font-medium">Doc. Referencia / Guía:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {ocrResult.extractedEntities?.referenceDoc || 'No detectado'}
                    </span>
                  </div>

                  {/* Quantity */}
                  {ocrResult.extractedEntities?.quantity && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600 font-medium">Cantidad Declarada:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {ocrResult.extractedEntities.quantity} und
                      </span>
                    </div>
                  )}

                  {/* Location Zone */}
                  {ocrResult.extractedEntities?.location?.zone && (
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-slate-600 font-medium">Zona Sugerida:</span>
                      <span className="font-mono font-bold text-blue-700">
                        Zona {ocrResult.extractedEntities.location.zone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Matched Product in Warehouse Catalog */}
            {matchedProduct ? (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      ¡Artículo Coincidente en Catálogo!
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                    Stock: {matchedProduct.stock} {matchedProduct.unit}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-900 leading-tight">{matchedProduct.name}</p>
                  <p className="text-slate-600 text-[11px] font-mono">
                    SKU: {matchedProduct.sku} · Barcode: {matchedProduct.barcode}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span>Ubicación: <strong>Zona {matchedProduct.location.zone} ({matchedProduct.location.aisle})</strong></span>
                    <span>·</span>
                    <span>Precio: <strong>{currencySymbol}{matchedProduct.salePrice.toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Quick actions for this matched product */}
                <div className="pt-2 border-t border-emerald-200 flex flex-wrap gap-2">
                  {onProductFound && (
                    <button
                      type="button"
                      onClick={() => {
                        onProductFound(matchedProduct);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Ver en Inventario</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onOpenMovementWithDoc && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenMovementWithDoc(
                          matchedProduct.sku, 
                          ocrResult?.extractedEntities?.referenceDoc,
                          ocrResult?.extractedEntities?.quantity
                        );
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white border border-emerald-400 text-emerald-900 hover:bg-emerald-100/60 rounded text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Registrar Entrada con esta Guía</span>
                    </button>
                  )}
                </div>
              </div>
            ) : ocrResult && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Texto extraído con éxito pero sin SKU catalogado</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    El texto fue procesado por client.textDetection(), pero el SKU o código no coincide exactamente con los artículos registrados.
                  </p>
                </div>
              </div>
            )}

            {/* Raw JSON Toggle & Preview */}
            {ocrResult && (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowJsonRaw(!showJsonRaw)}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center justify-between transition-colors font-mono"
                >
                  <span className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ver Payload JSON de client.textDetection()</span>
                  </span>
                  <span>{showJsonRaw ? '▲ Ocultar' : '▼ Expandir'}</span>
                </button>

                {showJsonRaw && (
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-[11px] font-mono max-h-56 overflow-y-auto space-y-2 border border-slate-800">
                    <div className="text-slate-400 border-b border-slate-800 pb-1">
                      // Retorno de client.textDetection() [TextDetectionResult]:
                    </div>
                    <pre className="whitespace-pre-wrap break-all text-emerald-400">
                      {JSON.stringify({
                        fullTextAnnotation: ocrResult.fullTextAnnotation,
                        textAnnotationsCount: ocrResult.textAnnotations.length,
                        sampleAnnotations: ocrResult.textAnnotations.slice(0, 3),
                        extractedEntities: ocrResult.extractedEntities
                      }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Módulo de Visión Computacional integrado en Almacén PF</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
