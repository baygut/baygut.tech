import { AnimationInterface } from '@google/model-viewer/lib/features/animation';
import { AnnotationInterface } from '@google/model-viewer/lib/features/annotation';
import { ARInterface } from '@google/model-viewer/lib/features/ar';
import { ControlsInterface } from '@google/model-viewer/lib/features/controls';
import { EnvironmentInterface } from '@google/model-viewer/lib/features/environment';
import { LoadingInterface } from '@google/model-viewer/lib/features/loading';
import { SceneGraphInterface } from '@google/model-viewer/lib/features/scene-graph';
import { StagingInterface } from '@google/model-viewer/lib/features/staging';
import ModelViewerElementBase from '@google/model-viewer/lib/model-viewer-base';
import React from 'react';

export type ModelViewerProps = AnnotationInterface &
  SceneGraphInterface &
  StagingInterface &
  EnvironmentInterface &
  ControlsInterface &
  ARInterface &
  LoadingInterface &
  AnimationInterface &
  ModelViewerElementBase;

//TODO(me): Remove this when the type is fixed in @google/model-viewer
type AnyType = any;

const ModelViewer = React.forwardRef<AnyType, AnyType>((props, ref) => (
  <model-viewer ref={ref as React.Ref<AnyType>} {...props} />
));
ModelViewer.displayName = 'ModelViewer';
export default ModelViewer;
