import { useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Trash2,
  AlertCircle,
  X,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  uploadCandidateResume,
  deleteCandidateResume,
} from '../../api/candidateProfileApi';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

const ResumeUpload = ({
  resumeData = { resumeUrl: '', resumeOriginalName: '', resumeSize: 0 },
  onUploaded,
  onDeleted,
  profile,
  onProfileUpdated,
}) => {

  const currentResumeUrl = resumeData?.resumeUrl || profile?.resumeUrl || '';
  const currentResumeName =
    resumeData?.resumeOriginalName ||
    profile?.resumeOriginalName ||
    (currentResumeUrl ? 'Resume.pdf' : '');
  const currentResumeSize =
    resumeData?.resumeSize || profile?.resumeSize || 0;

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return 'Please select a file';

    const extension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Invalid file format. Only PDF, DOC, and DOCX files are allowed.';
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return 'File size cannot exceed 5 MB.';
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSelectedFile(file);
  };

  const handleCancelSelection = () => {
    setSelectedFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a resume file first.');
      return;
    }

    try {
      setUploading(true);
      setErrorMessage('');
      setSuccessMessage('');
      setUploadProgress(0);

      const response = await uploadCandidateResume(
        selectedFile,
        (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        }
      );

      if (response?.success) {
        setSuccessMessage('Resume uploaded successfully!');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        const data = response.data;
        if (onUploaded) {
          onUploaded(data);
        }
        if (onProfileUpdated) {
          onProfileUpdated(data);
        }
      } else {
        setErrorMessage(response?.message || 'Failed to upload resume.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload resume. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your resume?')) {
      return;
    }

    try {
      setDeleting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await deleteCandidateResume();

      if (response?.success) {
        setSuccessMessage('Resume removed successfully.');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        const resetData = {
          resumeUrl: '',
          resumeOriginalName: '',
          resumeSize: 0,
          profileCompletion: response.data?.profileCompletion || 0,
        };

        if (onDeleted) {
          onDeleted(resetData);
        } else if (onUploaded) {
          onUploaded(resetData);
        }

        if (onProfileUpdated) {
          onProfileUpdated(response.data);
        }
      } else {
        setErrorMessage(response?.message || 'Failed to delete resume.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete resume.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Resume / CV</h2>
          <p className="mt-1 text-sm text-slate-400">
            Upload your resume so recruiters can review your qualifications.
          </p>
        </div>
        <span className="text-xs text-slate-400">
          PDF, DOC, DOCX up to 5 MB
        </span>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentResumeUrl && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white max-w-xs sm:max-w-md">
                    {currentResumeName}
                  </p>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Uploaded
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatFileSize(currentResumeSize)} • Included in profile (+15%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || deleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <RefreshCw size={13} />
                Replace
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={uploading || deleting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 size={13} />
                {deleting ? 'Removing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)} ready to upload
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelSelection}
                disabled={uploading}
                className="rounded-lg p-2 text-slate-400 hover:text-white transition cursor-pointer"
                title="Cancel selection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {uploading && (
            <div className="mt-3 space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-indigo-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedFile && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver(false);
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-white/10 bg-slate-900/40 hover:border-white/20 hover:bg-slate-900/60'
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-white">
            {currentResumeUrl
              ? 'Upload a new version to replace current resume'
              : 'Drag & drop your resume here, or browse files'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Supports PDF, DOC, DOCX up to 5 MB
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <span>Select file</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default ResumeUpload;
