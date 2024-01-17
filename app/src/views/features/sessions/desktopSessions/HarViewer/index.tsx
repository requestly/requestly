// import { FileDropAndView } from "components/mode-specific/desktop/FileDropAndView";
// import { useMemo } from "react";
// import {Har} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/harLogs/types";
// import NetworkSessionViewer from "../../SessionsIndexPageContainer/NetworkSessions/NetworkSessionViewer";

// const HarPreviewContainer: React.FC<{data: string}> = (props) => {
//     const har: Har = useMemo(() => 
//         JSON.parse(props.data)
//     , [props.data]);
//     return <NetworkSessionViewer har={har} />

// }

// export const HarViewerIndex: React.FC = () => {
//     return (
//         <FileDropAndView
//             FilePreviewComponent={HarPreviewContainer}
//             category='har'
//         />

//     );
// }