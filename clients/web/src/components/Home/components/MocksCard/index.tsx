// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { Link, useNavigate } from "react-router-dom";
// import { Col, Row, Spin } from "antd";
// import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
// import { RQButton } from "lib/design-system/components";
// import { getMocks } from "backend/mocks/getMocks";
// import { getUserAuthDetails } from "store/slices/global/user/selectors";
// import { MockRecordType, MockType, RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
// import { HomepageEmptyCard } from "../EmptyCard";
// import { m, AnimatePresence } from "framer-motion";
// import { MocksListItem } from "./components/MocksListItem";
// import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
// import { MdOutlineCloud } from "@react-icons/all-files/md/MdOutlineCloud";
// import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";
// import Logger from "lib/logger";
// import PATHS from "config/constants/sub/paths";
// import { trackHomeMockActionClicked } from "components/Home/analytics";
// import "./mocksCard.scss";

// export const MocksCard: React.FC = () => {
//   const MAX_MOCKS_TO_SHOW = 3;
//   const navigate = useNavigate();
//   const workspace = useSelector(getCurrentlyActiveWorkspace);
//   const user = useSelector(getUserAuthDetails);
//   const [isLoading, setIsLoading] = useState(true);
//   const [mocks, setMocks] = useState(null);
//   const [mockCollections, setMockCollections] = useState<{ [id: string]: RQMockCollection }>({});

//   useEffect(() => {
//     if (!user.loggedIn) {
//       setIsLoading(false);
//       return;
//     }
//     setIsLoading(true);
//     getMocks(user?.details?.profile?.uid, MockType.API, workspace?.id)
//       .then((data) => {
//         const mocks: RQMockMetadataSchema[] = [];
//         const collections: { [id: string]: RQMockCollection } = {};

//         data.forEach((record) => {
//           if (record.recordType === MockRecordType.COLLECTION) {
//             collections[record.id] = (record as unknown) as RQMockCollection;
//           } else {
//             mocks.push(record);
//           }
//         });

//         setMockCollections(collections);

//         const sortedMocks = mocks.sort(
//           (a: RQMockMetadataSchema, b: RQMockMetadataSchema) => Number(b.createdTs) - Number(a.createdTs)
//         );
//         setMocks(sortedMocks.slice(0, MAX_MOCKS_TO_SHOW));
//       })
//       .catch((err) => {
//         setMocks([]);
//         Logger.log(err);
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, [user?.details?.profile?.uid, workspace?.id, user.loggedIn]);

//   if (isLoading)
//     return (
//       <AnimatePresence>
//         <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="homepage-card-loader">
//           <Spin tip="Getting your mocks ready..." size="large" />
//         </m.div>
//       </AnimatePresence>
//     );

//   return (
//     <AnimatePresence>
//       {mocks?.length ? (
//         <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//           <Row align="middle" justify="space-between" className="w-full">
//             <Col span={18}>
//               <Row gutter={8} align="middle">
//                 <Col>
//                   <MdOutlineCloud className="mocks-card-icon" />
//                 </Col>
//                 <Col className="text-white primary-card-header">Mock Server</Col>
//               </Row>
//             </Col>
//             <Col span={6} className="mocks-card-action-btn">
//               <RQButton
//                 icon={<IoMdAdd className="mr-8" />}
//                 type="default"
//                 onClick={() => {
//                   trackHomeMockActionClicked("create_new_mock");
//                   redirectToMockEditorCreateMock(navigate);
//                 }}
//               >
//                 New Mock
//               </RQButton>
//             </Col>
//           </Row>
//           <div className="mocks-card-list">
//             {mocks.map((mock: RQMockMetadataSchema, index: number) => (
//               <MocksListItem key={index} mock={mock} collectionData={mockCollections[mock.collectionId]} />
//             ))}
//           </div>
//           {mocks.length > MAX_MOCKS_TO_SHOW && (
//             <Link
//               className="homepage-view-all-link"
//               to={PATHS.RULES.MY_RULES.ABSOLUTE}
//               onClick={() => trackHomeMockActionClicked("view_all_mocks")}
//             >
//               View all mock APIs
//             </Link>
//           )}
//         </m.div>
//       ) : (
//         <HomepageEmptyCard
//           icon={<MdOutlineCloud className="mocks-card-icon" />}
//           title="Mock Server"
//           description="Create mocks for your APIs with different status codes, delay, response headers or body."
//           primaryButton={
//             <RQButton
//               type="primary"
//               onClick={() => {
//                 trackHomeMockActionClicked("create_new_mock");
//                 redirectToMockEditorCreateMock(navigate);
//               }}
//             >
//               Create new Mock API
//             </RQButton>
//           }
//           secondaryButton={
//             <RQButton
//               type="text"
//               className="homepage-empty-card-secondary-btn"
//               onClick={() => {
//                 trackHomeMockActionClicked("learn_more");
//                 window.open("https://docs.requestly.com/general/mock-server/overview/", "_blank");
//               }}
//             >
//               Learn more
//             </RQButton>
//           }
//         />
//       )}
//     </AnimatePresence>
//   );
// };
