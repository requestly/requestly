import "./index.scss";
import { useCallback, useEffect, useState } from "react";
import { fileRecord, AccessedFileCategoryTag, getFileContents, getRecentlyAccesedFiles, openFileSelector } from "./desktopFileAccessActions";
import { toast } from "utils/Toast";
import SpinnerCard from "components/misc/SpinnerCard";
import { RQButton, RQModal } from "lib/design-system/components";
import { Divider, Typography } from "antd";


interface RecentFilesListProps {
    handleFileClicked: (file: fileRecord) => void;
    fileCategory?: AccessedFileCategoryTag;
}

// not good
const RecentFilesList: React.FC<RecentFilesListProps> = ( props: RecentFilesListProps) => {
    const [recentFiles, setRecentFiles] = useState<fileRecord[]>([]);
    const [fetchedOnce, setFetchedOnce] = useState<boolean>(false);
    useEffect(() => {
        getRecentlyAccesedFiles(props.fileCategory || 'unknown').then(files => {
            console.log("Fetched Recent files", files);
            setRecentFiles(files ?? []);
            setFetchedOnce(true);
        }).catch(e => {
            console.error(e);
            toast.error("Error fetching recently accessed files");
        })
    }, [props.fileCategory])

    return (

        <div className="recently-accessed-container">
        <Typography.Title level={3} className="recently-accessed-files-header">
            Recently Accessed File
        </Typography.Title>
        {fetchedOnce ? recentFiles.length ? (
            <ul>
                {recentFiles.map(file => {
                    return <li key={file.filePath} onClick={(event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
                        event.preventDefault();
                        props.handleFileClicked(file)
                    }}>{file.name}</li>
                })}
            </ul>
            ) : <h2>No recently fetched files</h2>: <SpinnerCard />}
        </div>
    )
}

// not good
interface FileDropZoneProps {
    onFileParsed: (fileContents: string, fileName: string, filePath: string) => void;
    category?: AccessedFileCategoryTag;
}
const FileDropZone: React.FC<FileDropZoneProps> = (props) => {
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    
    const handleBrowserAndSelectFilesClick = useCallback(async () => {
        setIsProcessing(true);
        try{
            const file = await openFileSelector(props.category)
            if (file) {
                props.onFileParsed(file.contents, file.name, file.filePath);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error opening file selector");
        }
        setIsProcessing(false);
    }, [props]);

    return <RQButton 
            onClick={handleBrowserAndSelectFilesClick}
            loading={isProcessing}
        >
            Browser and select your file
        </RQButton>
}

interface PreviewComponentProps {
    data: any
}

interface FileDropAndViewProps {
    FilePreviewComponent: React.FC<PreviewComponentProps>;
    category: AccessedFileCategoryTag;
}

export const FileDropAndView: React.FC<FileDropAndViewProps> = (props: FileDropAndViewProps) => {
    const { FilePreviewComponent } = props;
    const [previewData, setPreviewData] = useState<string>("");

    const handleFileClicked = useCallback((file: fileRecord) => {
        getFileContents(file.filePath).then(fileContents => {
            if(!fileContents) return
            setPreviewData(fileContents);
        }).catch(e => {
            console.error(e);
            toast.error("Error fetching file contents");
        })
    }, []);
    return (
        <div className="file-handler-wrapper">
            <div className="file-drop-zone">
                {previewData ? <FilePreviewComponent  data = {previewData} /> : <FileDropZone onFileParsed={(fileContents, fileName, filePath) => {
                    setPreviewData(fileContents);
                }} category={props.category} />}
            </div>
            <div className="recently-accessed">
                <RecentFilesList handleFileClicked={handleFileClicked} fileCategory={props.category}  />
            </div>
        </div>
    );
}

interface RecentlyAccessedFilesListProps {
    onFileSelected: (fileContents: string, fileName: string, filePath: string) => void;
    fileCategory?: AccessedFileCategoryTag;
}

const RecentlyAccessedFilesList: React.FC<RecentlyAccessedFilesListProps> = (props) => {
    const [recentFiles, setRecentFiles] = useState<fileRecord[]>([]);
    const [fetchedOnce, setFetchedOnce] = useState<boolean>(false);
    useEffect(() => {
        getRecentlyAccesedFiles(props.fileCategory || 'unknown').then(files => {
            console.log("Fetched Recent files", files);
            setRecentFiles(files ?? []);
            setFetchedOnce(true);
        }).catch(e => {
            console.error(e);
            toast.error("Error fetching recently accessed files");
        })
    }, [props.fileCategory])

    const handleFileClicked = useCallback((file: fileRecord) => {
        getFileContents(file.filePath).then(fileContents => {
            if(!fileContents) return
            props.onFileSelected(fileContents, file.name, file.filePath);
        }).catch(e => {
            console.error(e);
            toast.error("Error fetching file contents");
        })
    }, [props]);

    return (
        <div className="recently-accessed-container">
        <div className="header text-center">
            Recently Accessed File
        </div>
        {fetchedOnce ? recentFiles.length ? (
            <ul>
                {recentFiles.map(file => {
                    return <li key={file.filePath} onClick={(event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
                        event.preventDefault();
                        handleFileClicked(file)
                    }}>{file.name}</li>
                })}
            </ul>
            ) : <h2>No recently fetched files</h2>: <SpinnerCard />}
        </div>
    )
}

interface FilePickerProps {
    btnText?: string;
    modalTitle?: string;
    dropMessage?: string;
    category?: AccessedFileCategoryTag;
    onFileParsed: (fileContents: string, fileName: string, filePath: string) => void;
}

export const FilePickerModalBtn: React.FC<FilePickerProps> = (props) => {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    return (
        <>
            <RQButton
            type="primary"
            onClick={() => {
                setIsModalVisible(true);
            }}
            className="mt-8"
             >
                {props.btnText ?? "Open File"}
            </RQButton>
            <RQModal
                title={props.modalTitle || "Select File to be opened"}
                open={isModalVisible}
                footer={null}
                onCancel={() => {
                    setIsModalVisible(false);
                }}
            >
                <div className="import-modal-content-wrapper">
                    <div className="file-handler-wrapper">

                        <div className="header text-center mb-2">{props.dropMessage ?? "Select the file from your device"}
                        </div>
                        <div className="file-drop-zone">
                            <FileDropZone onFileParsed={(fileContents, fileName, filePath) => {
                                props.onFileParsed(fileContents, fileName, filePath)
                                setIsModalVisible(false);
                            }} />
                        </div>

                    </div>
                    <Divider type="vertical" className="divider"/>
                    <div className="recently-accessed">
                        <RecentlyAccessedFilesList onFileSelected={props.onFileParsed} fileCategory={props.category}  />
                    </div>
                </div>

            </RQModal>
        </>
    )
}
