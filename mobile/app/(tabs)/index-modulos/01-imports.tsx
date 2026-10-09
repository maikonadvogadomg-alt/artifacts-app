import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LibrarySearch from "@/components/LibrarySearch";
import ProjectPlanModal from "@/components/ProjectPlanModal";
import SiteExtractor from "@/components/SiteExtractor";
import { useApp } from "@/context/AppContext";
import { useApiBase } from "@/hooks/useApiBase";
import { useColors } from "@/hooks/useColors";
import { createRepo, getUser, listRepos } from "@/services/githubService";
import { exportZip, importTar, importZip } from "@/utils/zipUtils";
import type { Project } from "@/context/AppContext";
import { FEATURED_PROJECTS } from "@/data/featuredProjects";
