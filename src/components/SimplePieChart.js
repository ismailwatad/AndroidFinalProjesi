import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { colors, spacing, typography } from '../constants/theme';

const { width } = Dimensions.get('window');
const CHART_SIZE = Math.min(width - spacing.lg * 4, 280);
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE - 40) / 2;

const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Veri bulunamadı</Text>
      </View>
    );
  }

  // Toplamı hesapla
  const total = data.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);
  
  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Veri bulunamadı</Text>
      </View>
    );
  }

  // Açıyı radyana çevir
  const toRadians = (angle) => (angle * Math.PI) / 180;

  // Pasta dilimi için yol oluştur
  const createArcPath = (startAngle, endAngle) => {
    const startAngleRad = toRadians(startAngle);
    const endAngleRad = toRadians(endAngle);
    
    const x1 = CENTER_X + RADIUS * Math.cos(startAngleRad);
    const y1 = CENTER_Y + RADIUS * Math.sin(startAngleRad);
    const x2 = CENTER_X + RADIUS * Math.cos(endAngleRad);
    const y2 = CENTER_Y + RADIUS * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${CENTER_X} ${CENTER_Y} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  // Açılarla segmentleri hesapla
  let currentAngle = -90; // Üstten başla
  const segments = data.map((item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
    const percentage = amount / total;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      ...item,
      amount,
      percentage: (percentage * 100).toFixed(1),
      startAngle,
      endAngle,
      path: createArcPath(startAngle, endAngle),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <G>
            {segments.map((segment, index) => (
              <Path
                key={index}
                d={segment.path}
                fill={segment.color}
                opacity={0.85}
                stroke={colors.surface}
                strokeWidth={2}
              />
            ))}
          </G>
        </Svg>
      </View>
      
      {/* Açıklama */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendName}>{segment.name}</Text>
              <Text style={styles.legendPercentage}>{segment.percentage}%</Text>
            </View>
            <Text style={styles.legendAmount}>
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY',
                minimumFractionDigits: 2,
              }).format(segment.amount)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: CHART_SIZE,
    height: CHART_SIZE,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  legend: {
    width: '100%',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: spacing.sm,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  legendPercentage: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  legendAmount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
});

export default SimplePieChart;
