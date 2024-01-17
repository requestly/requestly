import { FilePickerModalBtn } from "components/mode-specific/desktop/FileDropAndView"
import { Har } from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types"
import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { PreviewType, harPreviewActions } from "store/features/har-preview/slice"
import { redirectToNetworkSession } from "utils/RedirectionUtils"
import { toast } from "utils/Toast"

export const ImportHarModalButton: React.FC = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleOnFileParsed = useCallback((fileContents: string, fileName: string, filePath: string) => {
        try {
            const har: Har = JSON.parse(fileContents)
            console.log("filename", fileName)
            console.log("filepath", filePath)


            dispatch(harPreviewActions.resetState())
            dispatch(harPreviewActions.setImportedHar(har))
            dispatch(harPreviewActions.setPreviewType(PreviewType.IMPORTED))
            redirectToNetworkSession(navigate)
        } catch (e) {
            console.error(e)
            toast.error("Error parsing file")
        }
    }, [dispatch, navigate])
    return (
        <>
            <FilePickerModalBtn
                category='har'
                btnText='Import HAR'
                modalTitle="Import HAR File"
                dropMessage="Import HAR File"
                onFileParsed={handleOnFileParsed}
            />
        </>
    )
}