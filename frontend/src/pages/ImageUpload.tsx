import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ScreeningSteps from '../components/ScreeningSteps';
import Card from '../components/Card';
import Button from '../components/Button';
import UploadArea from '../components/UploadArea';
import Badge from '../components/Badge';
import { useScreeningFlow } from '../hooks/useScreeningFlow';
// import { uploadRetinalImage } from '../services/screeningService';
import {
  uploadRetinalImage,
  validateRetinalImage,
} from '../services/screeningService';
import { SAMPLE_RETINA_IMG } from '../data/mockData';
import { ArrowRight, RefreshCcw, Trash2 } from 'lucide-react';

export default function ImageUpload() {
  const navigate = useNavigate();
  const { flow, setFlow } = useScreeningFlow();
  // const [preview, setPreview] = useState<string | null>(null);
  // const [fileName, setFileName] = useState<string>('');
  // const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<string | null>(null);

  useEffect(() => {
    if (!flow.screeningId) navigate('/screening/patient');
  }, [flow.screeningId, navigate]);

  // const handleFile = (file: File) => {
  // setFileName(file.name);
  //   const url = URL.createObjectURL(file);
  //   setPreview(url);
  // };
  const handleFile = async (file: File) => {
  setSelectedFile(file);
  setFileName(file.name);

  const url = URL.createObjectURL(file);
  setPreview(url);

  setValidating(true);
  setValidationError(null);
  setImageQuality(null);

  try {
    const result = await validateRetinalImage(file);

    setImageQuality(result.imageQuality);

    if (!result.valid) {
      setValidationError(result.message);
    }
  } catch (error) {
    setValidationError(
      error instanceof Error
        ? error.message
        : 'Unable to validate the image.'
    );
  } finally {
    setValidating(false);
  }
};

  // const handleContinue = async () => {
  //   if (!flow.screeningId) return;
  //   setUploading(true);
  //   const image = await uploadRetinalImage(flow.screeningId, fileName || 'sample_retina.jpg', preview || SAMPLE_RETINA_IMG);
  //   setFlow((f) => ({ ...f, retinalImage: image }));
  //   setUploading(false);
  //   navigate('/screening/analyzing');
  // };
  const handleContinue = async () => {
  if (!flow.screeningId || !selectedFile) return;

  setUploading(true);

  try {
    const image = await uploadRetinalImage(
      flow.screeningId,
      selectedFile,
      preview || SAMPLE_RETINA_IMG
    );

    setFlow((f) => ({ ...f, retinalImage: image }));
    navigate('/screening/analyzing');
  } catch (err) {
  } finally {
    setUploading(false);
  }
};

  // const useSample = () => {
  //   setFileName('sample_retina.svg');
  //   setPreview(SAMPLE_RETINA_IMG);
  // };

  return (
    <DashboardLayout>
      <ScreeningSteps current={2} />
      <div className="mt-8 max-w-xl">
        <h1 className="font-display text-2xl text-navy-900">Upload retinal image</h1>
        <p className="mt-1 text-sm text-navy-500">
          For best results, upload a clear retinal/fundus image taken in good lighting.
        </p>

        <Card className="mt-6">
          {!preview ? (
            <>
              <UploadArea onFileSelected={handleFile} />
              {/* <button
                onClick={useSample}
                className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <ImageIcon className="h-4 w-4" /> Use a sample image instead
              </button> */}
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="h-56 w-56 overflow-hidden rounded-full ring-4 ring-navy-800/90">
                <img src={preview} alt="Uploaded retinal preview" className="h-full w-full object-cover" />
              </div>
              <p className="text-sm text-navy-500">{fileName}</p>
              <Badge tone="teal">
                {validating
                ? 'Checking image…'
                : validationError
                  ? imageQuality === 'Poor'
                    ? 'Image quality: Poor'
                    : 'Invalid image'
                  : `Image quality: ${imageQuality ?? 'Checking…'}`}
            </Badge>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<RefreshCcw className="h-3.5 w-3.5" />}
                  iconPosition="left"
                  onClick={() => {
                    setPreview(null);
                    setFileName('');
                  }}
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  iconPosition="left"
                  onClick={() => {
                    setPreview(null);
                    setFileName('');
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
        </Card>

                {validationError && (
  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
    <p className="font-medium text-red-700">
      Invalid image
    </p>
    <p className="mt-1 text-sm text-red-600">
      {validationError}
    </p>
  </div>
)}
        <Button
  className="mt-6 w-full"
  disabled={
    !preview ||
    uploading ||
    validating ||
    !!validationError ||
    imageQuality !== 'Good'
  }
          onClick={handleContinue}
          icon={<ArrowRight className="h-4 w-4" />}
        >
          {uploading ? 'Uploading…' : 'Continue to Analysis'}
        </Button>
      </div>
    </DashboardLayout>
  );
}
