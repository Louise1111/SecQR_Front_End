import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import ConfirmOpenLinkModal from "./confirmOpenLink";
import ConfirmReportModal from "./confirmReport";
const Notification = ({ visible, onClose, scannedResult }) => {
  const [expanded, setExpanded] = useState(false);
  const [seeLessVisible, setSeeLessVisible] = useState(false);
  const [confirmOpenLink, setConfirmOpenLink] = useState(false);
  const [confirmReport, setConfirmReport] = useState(false);
  const [scannedId, setScannedId] = useState(null);
  const [link, setLink] = useState(null);
  const [reportStatus, setReportStatus] = useState(null);

  const onCancel = () => {
    setConfirmOpenLink(false);
    setConfirmReport(false);
  };

  const onConfirm = (status) => {
    setConfirmOpenLink(false);
    setConfirmReport(false);
    setReportStatus(status);
  };

  useEffect(() => {
    if (!visible) {
      setExpanded(false);
    }
  }, [visible]);

  useEffect(() => {
    if (scannedResult) {
      setScannedId(scannedResult.id);
      setLink(scannedResult.link);
      setReportStatus(scannedResult.report);
    }
  }, [scannedResult]);

  const handleSeeMore = () => {
    setExpanded(true);
    setSeeLessVisible(true);
  };

  const handleSeeLess = () => {
    setExpanded(false);
    setSeeLessVisible(false);
  };

  const handleClose = () => {
    onClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "MALICIOUS":
        return "#FF0000";
      case "SAFE":
        return "#009F2C";
      case "NOT THAT SAFE":
        return "#FF0000";
      default:
        return "black";
    }
  };

  if (!scannedResult) {
    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { height: expanded ? "auto" : 250 }]}
          >
            <Text>No data available</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View
          style={[styles.modalContent, { height: expanded ? "auto" : 240 }]}
        >
          <View style={styles.header}>
            <Image
              source={require("../assets/logo/logo.png")}
              style={styles.SecQR_logo}
            />
            <View style={styles.logoTextContainer}>
              <Text style={styles.ratingText}>
                <Text>Sec</Text>
                <Text style={{ color: "#0B8F87" }}>QR</Text>
                <Text> Rating: </Text>
                {scannedResult.link_status !== "MALICIOUS" &&
                scannedResult.link_status !== "NOT THAT SAFE" ? null : (
                  <Image
                    source={require("../assets/logo/caution.png")}
                    style={styles.cautionLogo}
                  />
                )}
              </Text>
              <Text style={styles.ResultText}>
                <Text
                  style={{ color: getStatusColor(scannedResult.link_status) }}
                >
                  {scannedResult.link_status}
                </Text>
              </Text>
              <Text style={styles.Link}>
                {scannedResult.link.includes("###")
                  ? scannedResult.link.split("###")[0]
                  : scannedResult.link}
              </Text>
              <Text
                style={[
                  styles.verify_qr_legitimacy,
                  {
                    color:
                      scannedResult.verify_qr_legitimacy ===
                      "Generated by SecQR APP"
                        ? "green"
                        : "red",
                  },
                ]}
              >
                {scannedResult.verify_qr_legitimacy}
              </Text>
            </View>
          </View>
          {scannedResult.link_status !== "SAFE" && reportStatus !== "Yes" && (
            <View style={styles.reportContainer}>
              <TouchableOpacity
                style={styles.reportImage}
                onPress={() => setConfirmReport(true)}
              >
                <Image
                  source={require("../assets/logo/report.png")}
                  style={styles.reportImage}
                />
                <Text style={styles.textReport}>Report?</Text>
              </TouchableOpacity>
              <ConfirmReportModal
                visible={confirmReport}
                onCancel={onCancel}
                onConfirm={(status) => onConfirm(status)}
                scannedId={scannedId}
              />
            </View>
          )}
          {scannedResult.link_status !== "SAFE" && (
            <TouchableOpacity
              style={styles.moreButton}
              onPress={expanded ? handleSeeLess : handleSeeMore}
            >
              <Text
                style={{
                  fontSize: 15,
                  textDecorationLine: "underline",
                }}
              >
                {expanded ? "See less" : "See more"}
              </Text>
              <Image
                source={require("../assets/logo/more.png")}
                style={styles.imageMore}
              />
            </TouchableOpacity>
          )}

          {expanded && (
            <View style={styles.additionalContent}>
              <View style={styles.addContentRow}>
                <Text
                  style={{
                    color: "#FF0000",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Threat Detected:
                </Text>
                <View style={styles.addContentRow2}>
                  <Text
                    style={{
                      textTransform: "capitalize",
                      color: "#FF0000",
                    }}
                  >
                    {scannedResult.malware_detected.length > 3
                      ? scannedResult.malware_detected.replace(/[\[\]']+/g, "")
                      : "0 Malicious Found"}
                  </Text>
                </View>
              </View>
              <View style={styles.addContentRow}>
                <Text
                  style={{
                    color: "#009F2C",
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Detected By:
                </Text>
                <View style={styles.addContentRow2}>
                  <Text style={{ color: "#009F2C" }}>
                    {scannedResult &&
                    scannedResult.malware_detected_tool.length > 3
                      ? scannedResult.malware_detected_tool.replace(
                          /[\[\]']+/g,
                          ""
                        )
                      : "0 Malicious Found"}
                  </Text>
                </View>
                <View style={styles.poweredByContainer}>
                  <Text style={styles.poweredByText}>Powered By</Text>
                  <Image
                    source={require("../assets/logo/VirusTotal_logo.png")}
                    style={styles.virusTotalLogo}
                  />
                </View>
              </View>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleClose} style={styles.Button}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (
                  scannedResult.link_status === "MALICIOUS" ||
                  scannedResult.link_status === "NOT THAT SAFE"
                ) {
                  setConfirmOpenLink(true);
                } else {
                  Linking.openURL(scannedResult.link);
                }
              }}
              style={[
                styles.Button,
                scannedResult.link_status === "MALICIOUS" ||
                scannedResult.link_status === "NOT THAT SAFE"
                  ? { backgroundColor: "#FF0000" }
                  : null,
              ]}
            >
              <Text style={styles.closeButtonText}>Open Link</Text>
            </TouchableOpacity>
            <ConfirmOpenLinkModal
              visible={confirmOpenLink}
              onCancel={onCancel}
              onConfirm={onConfirm}
              link={link}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#0B8F87",
    paddingBottom: 13,
    justifyContent: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "80%",
    marginBottom: -60,
    marginTop: -70,
  },
  logoTextContainer: {
    flexDirection: "column",
    maxWidth: "60%",
    marginTop: -70,
    marginLeft: 10,
    position: "relative",
    top: 13,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: -130,
    marginTop: 150,
    width: 186,
    marginBottom: 3,
  },
  ResultText: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: -130,
    marginTop: -5,
    marginBottom: 3,
    width: 186,
  },
  Link: {
    fontSize: 15,
    marginLeft: -130,
    color: "#000000",
    marginTop: -5,
    marginBottom: 7,
    width: 170,
    textDecorationLine: "underline",
  },
  verify_qr_legitimacy: {
    fontSize: 15,
    marginLeft: -130,
    color: "#000000",
    marginTop: -5,
    marginBottom: 30,
    width: 186,
  },
  SecQR_logo: {
    width: 296,
    height: 236,
    marginTop: 50,
    marginLeft: -80,
  },
  moreButton: {
    flexDirection: "row",
    bottom: -19,
    paddingBottom: 5,
    position: "relative",
  },
  imageMore: {
    marginTop: 4,
  },
  Button: {
    backgroundColor: "#0B8F87",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    bottom: 0,
    width: "50%",
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    bottom: -15,
    left: 0,
    right: 0,
    margin: 0,
    width: "90%",
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
  additionalContent: {
    marginTop: 22,
    alignItems: "stretch",
    paddingBottom: 10,
    flexDirection: "row",
  },
  addContentRow: {
    margin: 10,
    width: 125,
    marginTop: 5,
  },
  addContentRow2: {
    margin: 0,
    paddingLeft: 1,
    width: 125,
    marginTop: 5,
  },
  reportContainer: {
    flexDirection: "row",
    alignItems: "center",
    top: 10, // Adjust the positioning as needed
    right: 60, // Adjust the positioning as needed
    position: "absolute",
  },
  reportImage: {
    flexDirection: "row",
    alignItems: "center",
    width: 18,
    height: 19,
    marginRight: 3,
  },
  textReport: {
    fontSize: 14,
    marginRight: 10,
    width: 100,
    color: "red",
  },
  poweredByContainer: {
    flexDirection: "row",
    alignItems: "center",
    bottom: -25,
    left: "-50%",
  },
  poweredByText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.7)",
  },
  virusTotalLogo: {
    width: 77,
    height: 15,
  },
});

export default Notification;
