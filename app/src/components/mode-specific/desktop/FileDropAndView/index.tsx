import "./index.scss";
import { useCallback, useEffect, useState } from "react";
import { AccessedFile, AccessedFileCategoryTag, getFileContents, getRecentlyAccesedFiles, openFileSelector } from "./desktopFileAccessActions";
import { toast } from "utils/Toast";
import SpinnerCard from "components/misc/SpinnerCard";
import { RQButton } from "lib/design-system/components";


interface RecentFilesListProps {
    handleFileClicked: (file: AccessedFile) => void;
    fileCategory?: AccessedFileCategoryTag;
}
const RecentFilesList: React.FC<RecentFilesListProps> = ( props: RecentFilesListProps) => {
    const [recentFiles, setRecentFiles] = useState<AccessedFile[]>([]);
    const [fetchedOnce, setFetchedOnce] = useState<boolean>(false);
    useEffect(() => {
        getRecentlyAccesedFiles(props.fileCategory || 'unknown').then(files => {

            setRecentFiles(files);
            setFetchedOnce(true);
        }).catch(e => {
            console.error(e);
            toast.error("Error fetching recently accessed files");
        })
    })

    return fetchedOnce ? (
        <ul>
            {recentFiles.map(file => {
                return <li key={file.filePath} onClick={(event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
                    event.preventDefault();
                    props.handleFileClicked(file)
                }}>{file.name}</li>
            })}
        </ul>
    ) : <SpinnerCard />;
}

interface FileDropZoneProps {
    onFileParsed: (fileContents: string, fileName: string, filePath: string) => void;
    category?: AccessedFileCategoryTag;
}
const FileDropZone: React.FC<FileDropZoneProps> = (props: FileDropZoneProps) => {
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
            Browser and select your files
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

    const handleFileClicked = useCallback((file: AccessedFile) => {
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
            <div className="content">
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